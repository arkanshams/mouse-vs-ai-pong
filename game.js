const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Paddle settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const PADDLE_MARGIN = 18;
const PADDLE_SPEED = 5;

// Ball settings
const BALL_SIZE = 14;
const BALL_SPEED = 6;

// Game state
let playerY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
let aiY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
let ballX = WIDTH / 2 - BALL_SIZE / 2;
let ballY = HEIGHT / 2 - BALL_SIZE / 2;
let ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
let ballVelY = BALL_SPEED * (Math.random() * 2 - 1);

let playerScore = 0;
let aiScore = 0;

// Mouse control for player paddle
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;
    playerY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, playerY));
});

function resetBall(direction = 1) {
    ballX = WIDTH / 2 - BALL_SIZE / 2;
    ballY = HEIGHT / 2 - BALL_SIZE / 2;
    ballVelX = BALL_SPEED * direction;
    ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
}

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + r / 2, y + r / 2, r / 2, 0, Math.PI * 2, false);
    ctx.fill();
}

function drawNet() {
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.setLineDash([8, 16]);
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(WIDTH / 2, HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Net
    drawNet();

    // Paddles
    drawRect(PADDLE_MARGIN, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, "#0f0");
    drawRect(WIDTH - PADDLE_MARGIN - PADDLE_WIDTH, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, "#f00");

    // Ball
    drawCircle(ballX, ballY, BALL_SIZE, "#fff");
}

function update() {
    // Ball movement
    ballX += ballVelX;
    ballY += ballVelY;

    // Ball collision with top/bottom
    if (ballY <= 0) {
        ballY = 0;
        ballVelY *= -1;
    }
    if (ballY + BALL_SIZE >= HEIGHT) {
        ballY = HEIGHT - BALL_SIZE;
        ballVelY *= -1;
    }

    // Ball collision with player paddle
    if (
        ballX <= PADDLE_MARGIN + PADDLE_WIDTH &&
        ballY + BALL_SIZE > playerY &&
        ballY < playerY + PADDLE_HEIGHT
    ) {
        ballX = PADDLE_MARGIN + PADDLE_WIDTH;
        ballVelX *= -1;
        // Add spin depending on where it hit the paddle
        let centerHit = (ballY + BALL_SIZE / 2) - (playerY + PADDLE_HEIGHT / 2);
        ballVelY += centerHit * 0.15;
    }

    // Ball collision with AI paddle
    if (
        ballX + BALL_SIZE >= WIDTH - PADDLE_MARGIN - PADDLE_WIDTH &&
        ballY + BALL_SIZE > aiY &&
        ballY < aiY + PADDLE_HEIGHT
    ) {
        ballX = WIDTH - PADDLE_MARGIN - PADDLE_WIDTH - BALL_SIZE;
        ballVelX *= -1;
        let centerHit = (ballY + BALL_SIZE / 2) - (aiY + PADDLE_HEIGHT / 2);
        ballVelY += centerHit * 0.15;
    }

    // Score update
    if (ballX < 0) {
        aiScore++;
        document.getElementById("aiScore").textContent = aiScore;
        resetBall(1);
    }
    if (ballX + BALL_SIZE > WIDTH) {
        playerScore++;
        document.getElementById("playerScore").textContent = playerScore;
        resetBall(-1);
    }

    // AI paddle movement: follow the ball, but not perfectly
    let aiCenter = aiY + PADDLE_HEIGHT / 2;
    let ballCenter = ballY + BALL_SIZE / 2;

    if (aiCenter < ballCenter - 10) {
        aiY += PADDLE_SPEED;
    } else if (aiCenter > ballCenter + 10) {
        aiY -= PADDLE_SPEED;
    }
    // Clamp AI paddle position
    aiY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, aiY));
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game
resetBall();
gameLoop();