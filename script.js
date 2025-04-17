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
const rules = document.getElementById("rules");
const closeRulesButton = document.getElementById("close-rules");

const backgroundLayer = document.querySelector('.background-layer');
if (!backgroundLayer) {
  console.error("Background layer element not found!");
}

// Ensure the music loops forever
backgroundMusic.loop = true;

// Lower the volume of the background music
backgroundMusic.volume = 0.5; // Set to 50% volume (adjust as needed)

// Lower the volume of the point sound
pointSound.volume = 0.7; // Set to 70% volume (adjust as needed)

// Hide the rules when the close button is clicked
closeRulesButton.addEventListener("click", () => {
  rules.style.display = "none"; // Hide the rules
});

// Ensure the close button works on touch devices
closeRulesButton.addEventListener("touchstart", () => {
  rules.style.display = "none";
});

// Function to start the game
function startGame() {
  console.log("Game starting...");
  rules.style.display = "none"; // Hide the rules when the game starts
  startScreen.style.display = 'none'; // Hide the start screen

  // Set the player's initial position
  player.style.left = "50px"; // Consistent X-axis position
  player.style.bottom = "0px"; // Align with the bottom of the game area

  // Preload the GIF and switch to it once loaded
  const gif = new Image();
  gif.src = 'background-loop.gif';
  gif.onload = () => {
    backgroundLayer.classList.add('playing'); // Switch to the looping GIF
  };

  score = 0;
  speed = 5; // Starting speed
  obstacleFrequency = 2000; // Starting obstacle frequency
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
  console.log("Game resetting...");
  backgroundLayer.classList.remove('playing'); // Switch back to the static image
  clearInterval(gameInterval); // Stop spawning obstacles
  gameStarted = false; // Allow the game to restart
  gameOver = true; // Set game over flag

  // Remove all obstacles
  const obstacles = document.querySelectorAll(".obstacle");
  obstacles.forEach((obstacle) => obstacle.remove());

  // Reset the player's position
  player.style.left = "50px"; // Consistent X-axis position
  player.style.bottom = "0px"; // Align with the bottom of the game area

  // Ensure the player is idle (not running or jumping)
  player.classList.remove("running", "jump", "jumping");

  // Show game over popup
  gameOverPopup.style.display = "block";
  finalScoreDisplay.textContent = `Your Score: ${score}`;

  console.log("Game reset. Waiting for player to click 'Try Again'.");
}

// Function to spawn obstacles
function spawnObstacle() {
  if (!gameStarted || gameOver) return;

  const obstacle = document.createElement("div");
  obstacle.classList.add("obstacle");

  // Randomly select one of the three custom images
  const objectImages = ["sofa.png", "hole.png", "trash.png"];
  const randomImage = objectImages[Math.floor(Math.random() * objectImages.length)];

  // Set the obstacle's background to the selected image
  obstacle.style.backgroundImage = `url(${randomImage})`;
  obstacle.style.backgroundSize = "contain";
  obstacle.style.backgroundRepeat = "no-repeat";
  obstacle.style.backgroundPosition = "center";

  // Dynamically set obstacle size based on screen size
  if (window.innerWidth < 768) {
    obstacle.style.width = "15vw"; // Larger width for mobile
    obstacle.style.height = "20vh"; // Larger height for mobile
  } else {
    obstacle.style.width = "90px"; // Default width for desktop
    obstacle.style.height = "150px"; // Default height for desktop
  }

  gameArea.appendChild(obstacle);

  let obstaclePosition = gameArea.clientWidth;
  obstacle.style.left = `${obstaclePosition}px`;

  const obstacleInterval = setInterval(() => {
    if (gameOver) {
      clearInterval(obstacleInterval);
      return;
    }

    obstaclePosition -= speed;
    obstacle.style.left = `${obstaclePosition}px`;

    if (checkCollision(player, obstacle)) {
      clearInterval(obstacleInterval);
      resetGame();
      return;
    }

    if (obstaclePosition + obstacle.offsetWidth < 0) {
      clearInterval(obstacleInterval);
      if (gameArea.contains(obstacle)) {
        gameArea.removeChild(obstacle);
      }
      if (gameStarted && !gameOver) {
        increaseScore();
      }
    }
  }, 20);
}

// Function to check for collision
function checkCollision(player, obstacle) {
  const buffer = 20; // Adjust this value to increase or decrease sensitivity

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

  if (isColliding) {
    console.log("Collision detected! Stopping player animations...");
    stopRunning(); // Ensure the player stops running immediately
    player.classList.remove("jump", "jumping"); // Remove jump-related classes if the player is jumping
  }

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

    // Increase speed every 10 points
    if (score % 10 === 0) {
      speed = Math.min(speed + 1.5, 15); // Increase speed by 1.5, cap at 15
      console.log(`Speed increased to: ${speed}`);

      // Adjust obstacle frequency based on speed
      obstacleFrequency = Math.max(obstacleFrequency - 100, 800); // Decrease frequency, cap at 800ms
      console.log(`Obstacle frequency adjusted to: ${obstacleFrequency}ms`);

      // Restart obstacle spawning with the new frequency
      clearInterval(gameInterval);
      gameInterval = setInterval(spawnObstacle, obstacleFrequency);
    }
  }
}

// Function to handle jumping
function jump() {
  if (gameOver) return; // Prevent jumping if the game is over

  if (!gameStarted) startGame(); // Start the game if it hasn't started

  if (!player.classList.contains("jump")) {
    console.log("Jump triggered!");

    // Stop running animation when jumping
    stopRunning();

    // Add the jump class
    player.classList.add("jump", "jumping");

    // Remove the jump class when the jump ends
    setTimeout(() => {
      player.classList.remove("jump", "jumping");

      // Resume running animation after the jump only if the game is not over
      if (!gameOver) {
        startRunning();
      }
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

  // Reset the player's position
  player.style.left = "50px"; // Consistent X-axis position
  player.style.bottom = "0px"; // Align with the bottom of the game area

  // Remove all obstacles
  const obstacles = document.querySelectorAll(".obstacle");
  obstacles.forEach((obstacle) => obstacle.remove());

  gameOver = false; // Reset game over flag
  gameStarted = false; // Allow the game to start again

  console.log("Restarting game...");
  startGame();
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