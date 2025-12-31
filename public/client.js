const socket = io();
let clickPos = null;
let name = null;
let submitted = false;

function joinGame() {
  name = document.getElementById("teamName").value;
  if (name == '') return;
  socket.emit("register-player", name);
  document.getElementById("join").style.display = "none";
  document.getElementById("waiting").style.display = "block";
}

socket.on("round-started", ({ image }) => {
    console.log("going");
    document.getElementById("waiting").style.display = "none";
    if (name) {
        document.getElementById("game").style.display = "block";
        document.querySelector("#game button").disabled = false;
        document.querySelector("#game button").style.backgroundColor = '#22c55e'
        submitted = false;

        const img = document.getElementById("gameImage");
        const marker = document.getElementById("marker");

        img.src = image;
        clickPos = null;

        // hide marker for new round
        marker.style.display = "none";

        img.onclick = (e) => {
            if (submitted) return;

            const rect = img.getBoundingClientRect();

            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            clickPos = { x, y };
            console.log(clickPos);

            // position marker
            marker.style.left = `${x * 100}%`;
            marker.style.top = `${y * 100}%`;
            marker.style.display = "block";
        };
    }
});

function submit() {
  if (!clickPos) return alert("Click the image first!");
  socket.emit("submit-click", clickPos);
  document.querySelector("#game button").disabled = true;
  document.querySelector("#game button").style.backgroundColor = 'GREY'
  submitted = true;
}
