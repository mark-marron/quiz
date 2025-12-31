const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");


const app = express();
const server = http.createServer(app);
const io = new Server(server);

const imagesDir = path.join(__dirname, "public/images");
const images = fs.readdirSync(imagesDir).filter(f =>
  /\.(png|jpe?g|gif|webp)$/i.test(f)
);

let currentRound = -1;
let roundActive = false;
let gameResults = {
  rounds: []
};

let answers = [
  [0.520, 0.454],
  [0.808, 0.348],
  [0.567, 0.540],
  [0.657, 0.538]
]


app.use(express.static("public"));

let adminSocketId = null;
let players = {};
// socketId: {
//   teamName,
//   submitted: false,
//   click: null
// }

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("register-admin", () => {
    adminSocketId = socket.id;
    console.log("Admin registered");
  });

  socket.on("register-player", (teamName) => {
    players[socket.id] = { teamName, click: null };
    io.to(adminSocketId).emit("player-received", {
      teamName: teamName,
    });
  });

  socket.on("start-game", () => {
    if (images.length === 0) return;
    console.log(images)
    console.log(currentRound)
    gameResults.rounds.push({
      round: currentRound + 1,
      image: images[currentRound + 1],
      results: []
    });
  
    currentRound++;
    if (currentRound >= images.length) {
      io.emit("game-over");
      return;
    }
  
    // reset players for new round
    Object.values(players).forEach(player => {
      player.submitted = false;
      player.click = null;
    });
  
    roundActive = true;
  
    const imagePath = `/images/${images[currentRound]}`;
  
    io.emit("round-started", {
      round: currentRound + 1,
      totalRounds: images.length,
      image: imagePath
    });
  });

  socket.on("submit-click", ({ x, y }) => {
    console.log("submitting")
    const player = players[socket.id];
    if (!player) return;
    if (!roundActive || player.submitted) return;
  
    player.submitted = true;
    player.click = { x, y };
  
    // ✅ store result in JSON
    gameResults.rounds[currentRound].results.push({
      teamName: player.teamName,
      x,
      y
    });

    fs.writeFileSync(
      "results.json",
      JSON.stringify(gameResults, null, 2)
    );
  });
  

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.to(adminSocketId).emit("players-update", players);
  });
});

app.get("/results-data", (req, res) => {
  res.json({
    rounds: gameResults,
    answers
  });
});


server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
