// Game variables
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');

// Game settings
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Game state
let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gameLoop;

// Initialize game
function initGame() {
    // Initialize snake
    snake = [
        {x: 10, y: 10}, // Head
        {x: 9, y: 10},
        {x: 8, y: 10}  // Tail
    ];
    
    // Place first food
    placeFood();
    
    // Reset direction
    dx = 1;
    dy = 0;
    
    // Reset score
    score = 0;
    scoreDisplay.textContent = score;
    highScoreDisplay.textContent = highScore;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw initial state
    drawSnake();
    drawFood();
}

// Place food at random location
function placeFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Make sure food doesn't appear on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            return placeFood();
        }
    }
}

// Draw snake on canvas
function drawSnake() {
    // Draw each segment with gradient color
    snake.forEach((segment, index) => {
        // Head is a different color
        if (index === 0) {
            ctx.fillStyle = '#00ff00'; // Bright green head
        } else {
            // Body segments with gradient from head to tail
            const colorValue = Math.max(50, 255 - (index * 10));
            ctx.fillStyle = `rgb(0, ${colorValue}, 0)`;
        }
        
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        
        // Add border to segments
        ctx.strokeStyle = '#005500';
        ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

// Draw food on canvas
function drawFood() {
    // Draw apple-like food
    ctx.fillStyle = '#ff0000'; // Red
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize/2, 
        food.y * gridSize + gridSize/2, 
        gridSize/2 - 2, 
        0, 
        Math.PI * 2
    );
    ctx.fill();
    
    // Add shine effect
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize/3, 
        food.y * gridSize + gridSize/3, 
        gridSize/6, 
        0, 
        Math.PI * 2
    );
    ctx.fill();
}

// Move snake
function moveSnake() {
    // Create new head based on current direction
    let head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    // Wrap around edges
    if (head.x < 0) {
        head.x = tileCount - 1;
    } else if (head.x >= tileCount) {
        head.x = 0;
    }
    
    if (head.y < 0) {
        head.y = tileCount - 1;
    } else if (head.y >= tileCount) {
        head.y = 0;
    }
    
    // Check collision with self (just continue moving, no game over)
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            // Reset snake to initial position instead of ending game
            snake = [
                {x: 10, y: 10}, // Head
                {x: 9, y: 10},
                {x: 8, y: 10}  // Tail
            ];
            // Reset direction
            dx = 1;
            dy = 0;
            // Place new food
            placeFood();
            return;
        }
    }
    
    // Add new head to snake
    snake.unshift(head);
    
    // Check if food is eaten
    if (head.x === food.x && head.y === food.y) {
        // Increase score
        score += 10;
        scoreDisplay.textContent = score;
        
        // Update high score if needed
        if (score > highScore) {
            highScore = score;
            highScoreDisplay.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // Place new food
        placeFood();
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
}

// Main game loop
function gameStep() {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Move snake
    moveSnake();
    
    // Draw everything
    drawSnake();
    drawFood();
    
    // Continue game loop
    gameLoop = setTimeout(gameStep, 150);
}

// Game over function
function gameOver() {
    gameRunning = false;
    clearTimeout(gameLoop);
    
    // Show game over message
    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'game-over';
    gameOverDiv.innerHTML = `
        <h2>Game Over!</h2>
        <p>Your score: ${score}</p>
        <button class="restart-btn" onclick="restartGame()">Play Again</button>
    `;
    document.querySelector('.game-container').appendChild(gameOverDiv);
}

// Change direction based on key press
function changeDirection(e) {
    // Prevent reverse direction
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (dy === 0) {
                dx = 0;
                dy = -1;
            }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (dy === 0) {
                dx = 0;
                dy = 1;
            }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (dx === 0) {
                dx = -1;
                dy = 0;
            }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (dx === 0) {
                dx = 1;
                dy = 0;
            }
            break;
    }
}

// Start game
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gameStep();
    }
}

// Pause game
function pauseGame() {
    gameRunning = !gameRunning;
    pauseBtn.textContent = gameRunning ? 'Pause' : 'Resume';
    
    if (gameRunning) {
        gameStep();
    }
}

// Restart game
function restartGame() {
    // Remove game over message if exists
    const gameOverMsg = document.querySelector('.game-over');
    if (gameOverMsg) {
        gameOverMsg.remove();
    }
    
    // Reset game
    initGame();
    gameRunning = true;
    
    // Reset button text
    pauseBtn.textContent = 'Pause';
    
    // Start game loop
    clearTimeout(gameLoop);
    gameStep();
}

// Event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', restartGame);
document.addEventListener('keydown', changeDirection);

// Initialize game on load
window.onload = function() {
    initGame();
};