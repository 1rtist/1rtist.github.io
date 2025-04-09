let score = 0;
let speed = 8; // Starting speed of the obstacles
let obstacleFrequency = 1800; // Increase to 2000ms (2 seconds) for more spacing
let gameInterval;
let gameStarted = false; // Track if the game has started
let gameOver = false; // Track if the game is over

const player = document.getElementById("player");
const scoreDisplay = document.querySelector("#score");
const gameArea = document.querySelector("#game-area");
const startScreen = document.querySelector("#start-screen"); // Reference to the start screen
const gameOverPopup = document.querySelector("#game-over-popup"); // Reference to the game over popup
const finalScoreDisplay = document.querySelector("#final-score"); // Reference to the final score display
const tryAgainButton = document.querySelector("#try-again-button"); // Reference to the try again button
const backgroundMusic = document.getElementById("background-music");
const muteButton = document.getElementById("mute-button");
const pointSound = document.getElementById("point-sound");

// Ensure the music loops forever
backgroundMusic.loop = true;

// Lower the volume of the background music
backgroundMusic.volume = 0.5; // Set to 50% volume (adjust as needed)

// Lower the volume of the point sound
pointSound.volume = 0.7; // Set to 70% volume (adjust as needed)

// Function to start the game
function startGame() {
  console.log("Game starting...");
  score = 0;
  speed = 5;
  obstacleFrequency = 2000; // Set initial spawn frequency
  scoreDisplay.textContent = `Score: ${score}`;
  gameOver = false; // Reset game over flag
  gameStarted = true; // Mark the game as started

  // Check screen size and apply delay only for smaller screens
  const initialDelay = window.innerWidth < 768 ? obstacleFrequency * 2 : 0; // Double the obstacle frequency for smaller screens
  console.log(`Initial obstacle delay: ${initialDelay}ms`);

  setTimeout(() => {
    // Spawn the first obstacle after the delay
    spawnObstacle();
    gameInterval = setInterval(spawnObstacle, obstacleFrequency);
  }, initialDelay);
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

  stopRunning();

  // Restart the game with a delay only for smaller screens
  const restartDelay = window.innerWidth < 768 ? obstacleFrequency * 2 : 0; // Double the obstacle frequency for smaller screens
  console.log(`Restart obstacle delay: ${restartDelay}ms`);

  setTimeout(() => {
    console.log("Restarting game...");
    startGame();
  }, restartDelay);
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
  const buffer = 10; // Adjust this value to lower sensitivity (higher = less sensitive)

  const playerRect = player.getBoundingClientRect();
  const obstacleRect = obstacle.getBoundingClientRect();

  // Debugging logs to verify bounding box positions
  console.log("Player Rect:", playerRect);
  console.log("Obstacle Rect:", obstacleRect);

  // Check for collision with added buffer
  const isColliding = (
    playerRect.right - buffer > obstacleRect.left + buffer && // Player's right side is past the obstacle's left side
    playerRect.left + buffer < obstacleRect.right - buffer && // Player's left side is before the obstacle's right side
    playerRect.bottom - buffer > obstacleRect.top + buffer && // Player's bottom is below the obstacle's top
    playerRect.top + buffer < obstacleRect.bottom - buffer    // Player's top is above the obstacle's bottom
  );

  console.log("Collision check:", isColliding);
  return isColliding;
}

// Function to increase the score
function increaseScore() {
  if (gameStarted && !gameOver) { // Only increase score if the game is active
    score++;
    scoreDisplay.textContent = `Score: ${score}`;

    // Play sound effect every 10 points
    if (score % 10 === 0) {
      const pointSound = document.getElementById("point-sound");
      pointSound.currentTime = 0; // Reset the sound to the beginning
      pointSound.play(); // Play the sound
      console.log("10-point sound played!");
    }

    // Increase speed every 15 points
    if (score % 15 === 0) {
      speed += 1; // Increase the speed of the game
      console.log(`Speed increased to: ${speed}`);

      // Adjust obstacle frequency based on speed
      obstacleFrequency = Math.max(1800 - speed * 40, 1200); // Scale frequency with speed, but cap it at 1200ms
      console.log(`Obstacle frequency adjusted to: ${obstacleFrequency}ms`);

      // Restart obstacle spawning with the new frequency
      clearInterval(gameInterval);
      gameInterval = setInterval(spawnObstacle, obstacleFrequency);
    }
  }
}

// Function to handle jumping
function jump() {
  if (gameOver) return;

  if (!gameStarted) startGame();

  if (!player.classList.contains("jump")) {
    console.log("Jump triggered!");

    // Stop running animation when jumping
    stopRunning();

    // Add the jump class
    player.classList.add("jump", "jumping");

    // Remove the jump class when the jump ends
    setTimeout(() => {
      player.classList.remove("jump", "jumping");

      // Resume running animation after the jump
      startRunning();
    }, 1200); // Match the duration of the jump animation
  }
}

// Function to start running animation
function startRunning() {
  if (!player.classList.contains("running")) {
    player.classList.add("running"); // Add running animation
  }
}

// Function to stop running animation
function stopRunning() {
  player.classList.remove("running"); // Remove running animation
}

// Event listener for jump key (spacebar)
document.addEventListener("keydown", (event) => {
  if (event.key === " " && !player.classList.contains("jump")) {
    jump();
  } else {
    startRunning();
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
  gameStarted = false; // Allow the game to start again
});

gameArea.addEventListener("touchstart", (event) => {
  event.preventDefault(); // Prevent default touch behavior
  console.log("Touch detected on game area!");
  jump();
});

// Event listener for the mute button
muteButton.addEventListener("click", () => {
  if (backgroundMusic.paused) {
    backgroundMusic.play(); // Play the music
    muteButton.textContent = "🔊"; // Unmute icon
  } else {
    backgroundMusic.pause(); // Pause the music
    muteButton.textContent = "🔇"; // Mute icon
  }
});

// CSS for jump animation has been moved to style.css