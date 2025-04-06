let score = 0;
let speed = 5; // Starting speed of the obstacles
let obstacleFrequency = 2000; // Increase to 2000ms (2 seconds) for more spacing
let gameInterval;
let gameStarted = false; // Track if the game has started
let gameOver = false; // Track if the game is over

const player = document.querySelector("#player");
const scoreDisplay = document.querySelector("#score");
const gameArea = document.querySelector("#game-area");
const startScreen = document.querySelector("#start-screen"); // Reference to the start screen
const gameOverPopup = document.querySelector("#game-over-popup"); // Reference to the game over popup
const finalScoreDisplay = document.querySelector("#final-score"); // Reference to the final score display
const tryAgainButton = document.querySelector("#try-again-button"); // Reference to the try again button

// Function to start the game
function startGame() {
  console.log("Game starting...");
  score = 0;
  speed = 5;
  obstacleFrequency = 2000; // Set initial spawn frequency
  scoreDisplay.textContent = `Score: ${score}`;
  gameOver = false; // Reset game over flag
  gameStarted = true; // Mark the game as started

  // Spawn obstacles
  spawnObstacle();
  gameInterval = setInterval(spawnObstacle, obstacleFrequency);
}

// Function to reset the game
function resetGame() {
  clearInterval(gameInterval); // Stop spawning obstacles
  gameStarted = false; // Allow the game to restart
  gameOver = true; // Set game over flag

  // Remove all obstacles
  const obstacles = document.querySelectorAll(".obstacle");
  obstacles.forEach((obstacle) => obstacle.remove());

  // Show game over popup
  gameOverPopup.style.display = "block";
  finalScoreDisplay.textContent = `Your Score: ${score}`;
}

// Function to spawn obstacles
function spawnObstacle() {
  if (!gameStarted || gameOver) return; // Stop spawning if the game is not active

  const obstacle = document.createElement("div");
  obstacle.classList.add("obstacle");
  gameArea.appendChild(obstacle);

  let obstaclePosition = gameArea.clientWidth; // Start from the right edge
  obstacle.style.left = `${obstaclePosition}px`;

  const obstacleInterval = setInterval(() => {
    if (gameOver) {
      clearInterval(obstacleInterval); // Stop obstacle movement if the game is over
      return;
    }

    obstaclePosition -= speed; // Move left
    obstacle.style.left = `${obstaclePosition}px`;

    // Check for collision
    if (checkCollision(player, obstacle)) {
      console.log("Collision detected! Resetting game...");
      clearInterval(obstacleInterval);
      resetGame(); // End the game
      return; // Stop further execution of this interval
    }

    // Remove obstacle when it goes off-screen
    if (obstaclePosition + obstacle.offsetWidth < 0) {
      clearInterval(obstacleInterval);
      if (gameArea.contains(obstacle)) {
        gameArea.removeChild(obstacle); // Safely remove the obstacle
      }
      if (gameStarted && !gameOver) {
        console.log("Obstacle avoided! Increasing score...");
        increaseScore(); // Increase score when the obstacle is avoided
      }
    }
  }, 20); // Adjust interval for smoother movement
}

// Function to check for collision
function checkCollision(player, obstacle) {
  const playerRect = player.getBoundingClientRect();
  const obstacleRect = obstacle.getBoundingClientRect();

  // Debugging logs to verify bounding box positions
  console.log("Player Rect:", playerRect);
  console.log("Obstacle Rect:", obstacleRect);

  // Check for collision
  const isColliding = (
    playerRect.right > obstacleRect.left && // Player's right side is past the obstacle's left side
    playerRect.left < obstacleRect.right && // Player's left side is before the obstacle's right side
    playerRect.bottom > obstacleRect.top && // Player's bottom is below the obstacle's top
    playerRect.top < obstacleRect.bottom    // Player's top is above the obstacle's bottom
  );

  console.log("Collision check:", isColliding);
  return isColliding;
}

// Function to increase the score
function increaseScore() {
  if (gameStarted && !gameOver) { // Only increase score if the game is active
    score++;
    scoreDisplay.textContent = `Score: ${score}`;

    // Increase speed every 10 points
    if (score % 10 === 0) {
      speed += 1;
      console.log(`Speed increased to: ${speed}`);
    }

    // Decrease obstacle frequency every 10 points
    if (score % 10 === 0) {
      obstacleFrequency = Math.max(500, obstacleFrequency - 100); // Ensure a minimum frequency
      clearInterval(gameInterval);
      gameInterval = setInterval(spawnObstacle, obstacleFrequency); // Restart obstacle spawning with new frequency
    }
  }
}

// Function to handle jumping
function jump() {
  if (!player.classList.contains("jump")) {
    player.classList.add("jump");
    setTimeout(() => {
      player.classList.remove("jump");
    }, 1200); // Match the duration of the jump animation in CSS
  }
}

// Event listener for jump key (spacebar)
document.addEventListener("keydown", (event) => {
  if (event.key === " ") { // Spacebar is the jump key
    jump();
  }
});

// Event listener for touch input (tap on the screen)
document.addEventListener("touchstart", () => {
  jump();
});

// Event listener for clicking the start screen
startScreen.addEventListener("click", () => {
  console.log("Start screen clicked!");
  startScreen.style.display = "none"; // Hide the start screen
});

// Event listener for the "Try Again" button
tryAgainButton.addEventListener("click", () => {
  console.log("Try Again clicked!");
  gameOverPopup.style.display = "none"; // Hide the game over popup
  player.style.left = "50px"; // Reset player position
  player.style.bottom = "50px"; // Reset player position
  gameOver = false; // Reset game over flag
});

// CSS for jump animation has been moved to style.css