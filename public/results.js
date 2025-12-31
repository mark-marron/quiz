let data;
let roundIndex = 0;
let clickStage = 0; // 0=image only, 1=answer, 2=players

const img = document.getElementById("roundImage");
const canvas = document.getElementById("overlay2");
const ctx = canvas.getContext("2d");
const button = document.getElementById("next");

fetch("/results-data")
  .then(res => res.json())
  .then(json => {
    data = json;
    loadRound();
  });

function loadRound() {
  clickStage = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const round = data.rounds.rounds[roundIndex];
  console.log(data.rounds.rounds)
  img.src = `/images/${round.image}`;

  img.onload = () => {
    const rect = img.getBoundingClientRect();
  
    canvas.width = rect.width;
    canvas.height = rect.height;
  
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
  };
  
}

button.addEventListener("click", () => {
  clickStage++;

  if (clickStage === 1) {
    drawAnswer();
  } else if (clickStage === 2) {
    drawPlayers();
    showResults();
  } else {
    roundIndex++;
    if (roundIndex >= data.rounds.rounds.length) {
      roundIndex = 0;
    }
    loadRound();
  }
});

function drawCircle(x, y, color, radius = 8) {
  ctx.beginPath();
  ctx.arc(
    x * canvas.width,
    y * canvas.height,
    radius,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = color;
  ctx.fill();
}

function drawAnswer() {
  const [x, y] = data.answers[roundIndex];
  drawCircle(x, y, "Lime", 10);
}

function drawPlayers() {
  const results = data.rounds.rounds[roundIndex].results;

  results.forEach(r => {
    drawCircle(r.x, r.y, "red", 10);
  });
}

function distance(a, b) {
  const dx = a[0] - b.x;
  const dy = a[1] - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function showResults() {
  const list = document.getElementById("results");
  list.innerHTML = "";

  const answer = data.answers[roundIndex];
  const results = data.rounds.rounds[roundIndex].results;

  results.forEach(r => {
    const d = distance(answer, r);
    const correct = d <= 0.06;

    const li = document.createElement("li");
    li.textContent = `${r.teamName} - ${correct ? " Correct" : " Wrong"}`;
    li.style.color = correct ? "green" : "red";

    list.appendChild(li);
  });
}
