const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const hitsText = document.getElementById("hits");
const homeRunsText = document.getElementById("homeRuns");
const ballsLeftText = document.getElementById("ballsLeft");
const message = document.getElementById("message");
const speedSelect = document.getElementById("speed");
const pitchButton = document.getElementById("pitchButton");
const swingButton = document.getElementById("swingButton");
const resetButton = document.getElementById("resetButton");


// ゲームの状態

let score = 0;
let hits = 0;
let homeRuns = 0;
let ballsLeft = 10;

let ballX = 230;
let ballY = 215;
let ballSpeed = 0;
let ballMoving = false;
let ballHit = false;

let flyX = 0;
let flyY = 0;

let batAngle = -1;
let swingFrame = 0;


// ゲームの処理

function startPitch() {
  if (ballMoving || ballsLeft === 0) {
    return;
  }

  ballX = 230;
  ballY = 215;
  ballHit = false;

  // 80km/h → 遅い、120km/h → 速い
  ballSpeed = Number(speedSelect.value) / 14;

  ballMoving = true;
  message.textContent = speedSelect.value + " km/h";
  pitchButton.disabled = true;
  swingButton.disabled = false;

  requestAnimationFrame(gameLoop);
}

function swing() {
  if (!ballMoving || swingFrame > 0) {
    return;
  }

  swingFrame = 10;

  const result = judgeBall(ballX);

  if (result === "homeRun") {
    hitBall(true);
  } else if (result === "hit") {
    hitBall(false);
  } else {
    message.textContent = "空振り！";
  }
}

// ボールの位置だけを見て判定する
function judgeBall(x) {
  if (x >= 755 && x <= 785) {
    return "homeRun";
  }

  if (x >= 720 && x <= 815) {
    return "hit";
  }

  return "miss";
}

function hitBall(isHomeRun) {
  ballHit = true;

  // 打った瞬間はホームベース付近へ移動
  ballX = 770;
  ballY = 335;

  if (isHomeRun) {
    message.textContent = "HOME RUN!";
    score += 300;
    homeRuns++;

    // 高く遠く飛ばす
    flyX = -13;
    flyY = -11;
  } else {
    message.textContent = "HIT!";
    score += 100;

    // 少し低めに飛ばす
    flyX = -10;
    flyY = -8;
  }

  hits++;
  updateScore();
}


// アニメーション

function gameLoop() {
  if (!ballMoving) {
    return;
  }

  moveBat();
  moveBall();
  draw();

  requestAnimationFrame(gameLoop);
}

function moveBall() {
  if (ballHit) {
    // 打球
    ballX += flyX;
    ballY += flyY;

    // 少しずつ下向きにして山なりにする
    flyY += 0.35;

    if (ballX < -20 || ballY > canvas.height + 20) {
      finishPitch();
    }

    return;
  }

  // 投球
  ballX += ballSpeed;
  ballY += ballSpeed * 0.22;

  // バッターを通り過ぎたら終了
  if (ballX > 850) {
    message.textContent = "見逃し / 空振り";
    finishPitch();
  }
}

function moveBat() {
  if (swingFrame === 0) {
    return;
  }

  // 前半5フレームで振り、後半5フレームで戻す
  if (swingFrame > 5) {
    batAngle += 0.65;
  } else {
    batAngle -= 0.65;
  }

  swingFrame--;

  if (swingFrame === 0) {
    batAngle = -1;
  }
}

// 1球終了・リセット

function finishPitch() {
  ballMoving = false;
  ballHit = false;
  ballsLeft--;
  batAngle = -1;
  swingFrame = 0;

  updateScore();
  swingButton.disabled = true;

  if (ballsLeft === 0) {
    message.textContent = "ゲーム終了！ SCORE " + score;
    pitchButton.disabled = true;
  } else {
    pitchButton.disabled = false;
  }

  draw();
}

function resetGame() {
  score = 0;
  hits = 0;
  homeRuns = 0;
  ballsLeft = 10;

  ballX = 230;
  ballY = 215;
  ballMoving = false;
  ballHit = false;

  batAngle = -1;
  swingFrame = 0;

  message.textContent = "投球ボタンでスタート";
  pitchButton.disabled = false;
  swingButton.disabled = true;

  updateScore();
  draw();
}

function updateScore() {
  scoreText.textContent = score;
  hitsText.textContent = hits;
  homeRunsText.textContent = homeRuns;
  ballsLeftText.textContent = ballsLeft;
}


// Canvasの描画

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawField();
  drawPerson(220, 245);
  drawBatter();
  drawBall();
}

function drawField() {
  // 空
  ctx.fillStyle = "#79b9e8";
  ctx.fillRect(0, 0, canvas.width, 260);

  // 芝
  ctx.fillStyle = "#39733d";
  ctx.fillRect(0, 260, canvas.width, 240);

  // 土
  ctx.fillStyle = "#a87445";
  ctx.beginPath();
  ctx.ellipse(470, 370, 280, 95, 0, 0, Math.PI * 2);
  ctx.fill();

  // ホームベース
  ctx.fillStyle = "white";
  ctx.fillRect(750, 355, 40, 10);
}

function drawPerson(x, y) {
  ctx.save();
  ctx.translate(x, y);

  ctx.strokeStyle = "#152033";
  ctx.fillStyle = "#152033";
  ctx.lineWidth = 13;
  ctx.lineCap = "round";

  // 頭
  ctx.beginPath();
  ctx.arc(0, -40, 16, 0, Math.PI * 2);
  ctx.fill();

  // 胴体と足
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(0, 25);
  ctx.moveTo(0, 20);
  ctx.lineTo(-20, 55);
  ctx.moveTo(0, 20);
  ctx.lineTo(20, 55);
  ctx.stroke();

  ctx.restore();
}

function drawBatter() {
  drawPerson(805, 330);

  ctx.save();
  ctx.translate(790, 325);
  ctx.rotate(batAngle);

  ctx.strokeStyle = "#d7a15c";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(100, 0);
  ctx.stroke();

  ctx.restore();
}

function drawBall() {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
  ctx.fill();
}


// イベント

pitchButton.addEventListener("click", startPitch);
swingButton.addEventListener("click", swing);
resetButton.addEventListener("click", resetGame);

document.addEventListener("keydown", function(event) {
  if (event.code === "Space") {
    swing();
  }
});

resetGame();
