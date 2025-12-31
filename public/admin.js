const socket = io();
socket.emit("register-admin");

function nextRound() {
  socket.emit("start-game");
}

socket.on("round-started", ({ image, round, totalRounds }) => {
  const img = document.getElementById("adminImage");
  img.src = image;
  document.getElementById("top").innerHTML = "";
  document.getElementById("results").innerHTML = "";
});

socket.on("player-received", ({ teamName}) => {
  const li = document.createElement("li");
  li.textContent = `${teamName}`;
  document.getElementById("players").appendChild(li);
});
