let score = 0;
let speed = 8; // Starting speed of the obstacles
let obstacleFrequency = 1800; // Increase to 2000ms (2 seconds) for more spacing
let gameInterval;
let gameStarted = false; // Track if the game has started
let gameOver = false; // Track if the game is over
let highestScore = localStorage.getItem("highestScore") || 0; // Retrieve the highest score from localStorage or default to 0
let isMuted = false; // Track if the game is muted

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

  // Hide the start screen
  startScreen.style.display = "none";

  // Reset game variables
  score = 0;
  speed = 5; // Starting speed
  obstacleFrequency = 2000; // Starting obstacle frequency
  scoreDisplay.textContent = `Score: ${score}`;
  gameOver = false; // Reset game over flag
  gameStarted = true; // Mark the game as started

  // Start background animation
  const gif = new Image();
  gif.src = 'background-loop.gif';
  gif.onload = () => {
    backgroundLayer.classList.add('playing'); // Switch to the looping GIF
  };

  // Start the player's running animation
  startRunning();

  // Spawn the first obstacle after a delay
  const initialDelay = window.innerWidth < 768 ? obstacleFrequency * 2 : 0; // Double the obstacle frequency for smaller screens
  console.log(`Initial obstacle delay: ${initialDelay}ms`);

  setTimeout(() => {
    spawnObstacle();
    gameInterval = setInterval(spawnObstacle, obstacleFrequency);
  }, initialDelay);
}

// Function to reset the game
function resetGame() {
  rewardShown = false; // Allow rewards to be shown again
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
  const objectImages = ["trash.png", "hole.png", "dog.png"];
  const randomImage = objectImages[Math.floor(Math.random() * objectImages.length)];

  // Set the obstacle's background to the selected image
  obstacle.style.backgroundImage = `url(${randomImage})`;
  obstacle.style.backgroundSize = "contain";
  obstacle.style.backgroundRepeat = "no-repeat";
  obstacle.style.backgroundPosition = "center";

  // Ensure the obstacle is aligned with the bottom
  obstacle.style.bottom = "0px"; // Keep it at the bottom

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
      handleCollision(); // Trigger the falling effect
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

  // Store the interval ID in the obstacle's dataset
  obstacle.dataset.intervalId = obstacleInterval;
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

    // Update the progress meter
    updateProgressMeter(score);
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
startScreen.addEventListener("click", startGame);

// Event listener for the "Try Again" button
tryAgainButton.addEventListener("click", () => {
  console.log("Try Again clicked!");

  // Hide the game over popup
  gameOverPopup.style.display = "none";

  // Reset the player's position and state
  player.style.left = "50px"; // Reset X-axis position
  player.classList.remove("falling", "jump", "jumping", "running"); // Remove all animations

  // Reset the background
  gameArea.classList.remove("infinite-space"); // Remove the infinite space effect
  backgroundLayer.classList.remove("playing"); // Reset the background animation

  // Remove all obstacles
  const obstacles = document.querySelectorAll(".obstacle");
  obstacles.forEach((obstacle) => {
    clearInterval(obstacle.dataset.intervalId); // Clear the interval for each obstacle
    obstacle.remove(); // Remove the obstacle from the DOM
  });

  // Clear the main obstacle spawning interval
  clearInterval(gameInterval);

  // Reset game variables
  score = 0;
  speed = 5; // Reset speed
  obstacleFrequency = 2000; // Reset obstacle frequency
  scoreDisplay.textContent = `Score: ${score}`;
  gameOver = false; // Reset game over flag
  gameStarted = false; // Allow the game to start again

  console.log("Restarting game...");
  startGame(); // Start the game fresh
});

gameArea.addEventListener("touchstart", (event) => {
  event.preventDefault(); // Prevent default touch behavior
  console.log("Touch detected on game area!");
  jump();
});

// Event listener for the mute button
muteButton.addEventListener("click", () => {
  isMuted = !isMuted; // Toggle the mute state

  if (isMuted) {
    backgroundMusic.pause(); // Pause the music
    muteButton.textContent = "🔇"; // Mute icon
  } else {
    backgroundMusic.play(); // Play the music
    muteButton.textContent = "🔊"; // Unmute icon
  }
});

// Function to trigger flash effect
function triggerFlash() {
  // Create the flash element
  const flash = document.createElement('div');
  flash.classList.add('flash');

  // Add the flash to the game area
  document.body.appendChild(flash);

  // Remove the flash after the animation ends
  setTimeout(() => {
    if (document.body.contains(flash)) {
      document.body.removeChild(flash);
    }
  }, 300); // Match the animation duration (0.3s)
}

// CSS for jump animation has been moved to style.css

function handleCollision() {
  console.log("Collision detected!");

  // Stop the game
  gameOver = true;

  // Remove the background
  gameArea.classList.add("infinite-space");

  // Trigger the player falling effect
  player.classList.add("falling");

  // Stop the background music
  backgroundMusic.pause();

  // Check if the player qualifies for a reward
  const reward = getReward(score);
  if (reward) {
    // Show reward screen and play winning sound
    showRewardScreen(score);
  } else {
    // Play the losing sound effect if no reward is won
    const loseSound = document.getElementById("lose-sound");
    loseSound.currentTime = 0; // Reset the sound to the beginning
    loseSound.play();
    loseSound.volume = 0.3; // Set to 30% volume (adjust as needed)

    // Remove any existing event listeners to avoid duplication
    loseSound.removeEventListener("ended", resumeBackgroundMusic);

    // Add the event listener to resume background music after the losing sound finishes
    loseSound.addEventListener("ended", resumeBackgroundMusic);
  }

  // Update the highest score
  if (score > highestScore) {
    highestScore = score; // Update the highest score
    localStorage.setItem("highestScore", highestScore); // Save the highest score to localStorage
  }

  // Optional: Add a delay before showing the "Game Over" popup
  setTimeout(() => {
    gameOverPopup.style.display = "block";
    finalScoreDisplay.textContent = `Your Score: ${score}`;
    const highestScoreDisplay = document.getElementById("highest-score");
    highestScoreDisplay.textContent = `Highest Score: ${highestScore}`; // Display the highest score
  }, 2000); // Wait for the falling animation to finish
}

// Function to resume background music
function resumeBackgroundMusic() {
  backgroundMusic.play();
}

// Reward thresholds and codes
const rewards = [
  { score: 50, title: "10% OFF the UNIFORM", code: "use code: youcoulddobetter" },
  { score: 100, title: "15% OFF the UNIFORM", code: "use code: thatsalilbetter" },
  { score: 300, title: "25% OFF the UNIFORM", code: "use code: okchilloutyoucantdobetterthenthis" },
  { score: 5, title: "Free Uniforms Shirt", code: "use code: 500?youreallydidthat?" },
];

// Function to get the highest reward based on score
function getReward(score) {
  for (let i = rewards.length - 1; i >= 0; i--) {
    if (score >= rewards[i].score) {
      return rewards[i];
    }
  }
  return null;
}

// Function to show the reward screen
function showRewardScreen(score) {
  const reward = getReward(score);
  if (!reward) return; // No reward if score is below the minimum threshold

  const rewardOverlay = document.getElementById("reward-overlay");
  const caseClosed = document.getElementById("case-closed");
  const caseOpened = document.getElementById("case-opened");
  const rewardTitle = document.getElementById("reward-title");
  const rewardCode = document.getElementById("reward-code");
  const copyCodeButton = document.getElementById("copy-code");
  const shopNowButton = document.getElementById("shop-now");
  const countdownTimer = document.getElementById("countdown-timer");
  const closeRewardButton = document.getElementById("close-reward");
  const winningSound = document.getElementById("winning-sound"); // Reference to the winning sound

  // Initially hide the close button
  closeRewardButton.style.display = "none";

  // Play the winning sound
  winningSound.currentTime = 0; // Reset the sound to the beginning
  winningSound.volume = 0.4; // Set to 30% volume
  winningSound.play();

  // Set reward details
  rewardTitle.textContent = `You Unlocked: ${reward.title}`;
  rewardCode.textContent = reward.code;

  // Show the reward overlay
  rewardOverlay.style.display = "flex";

  // Handle case opening animation
  caseClosed.addEventListener("click", () => {
    caseClosed.style.display = "none";
    caseOpened.style.display = "block";
    startCountdown(15 * 60, countdownTimer); // Start 15-minute countdown

    // Show the close button after the code is revealed
    closeRewardButton.style.display = "block";
  });

  // Copy code to clipboard
  copyCodeButton.addEventListener("click", () => {
    navigator.clipboard.writeText(reward.code).then(() => {
      alert("Code copied to clipboard!");
    });
  });

  // Redirect to shop
  shopNowButton.addEventListener("click", () => {
    window.location.href = "https://scaresociety.org/collections/frontpage"; // Replace with your shop URL
  });

  // Close the reward screen
  closeRewardButton.addEventListener("click", () => {
    rewardOverlay.style.display = "none";
  });
}

// Function to start the countdown timer
function startCountdown(duration, display) {
  let timer = duration;
  const interval = setInterval(() => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    display.textContent = `Expires in: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    timer--;

    if (timer < 0) {
      clearInterval(interval);
      display.textContent = "Reward expired!";
    }
  }, 1000);
}

// Function to update the progress meter
function updateProgressMeter(score) {
  const progressIndicator = document.getElementById("progress-indicator");
  const checkpoints = document.querySelectorAll(".checkpoint");

  // Define the score thresholds for each checkpoint
  const thresholds = [0, 50, 100, 300, 500];

  // Calculate the progress percentage based on the score
  let progressPercentage = 0;
  for (let i = 0; i < thresholds.length - 1; i++) {
    if (score >= thresholds[i] && score < thresholds[i + 1]) {
      const range = thresholds[i + 1] - thresholds[i];
      const progressInRange = score - thresholds[i];
      progressPercentage = ((i * 25) + (progressInRange / range) * 25); // Map to 0-100%
      break;
    } else if (score >= thresholds[thresholds.length - 1]) {
      progressPercentage = 100; // Cap at 100% for scores >= 500
    }
  }

  // Update the progress bar width
  progressIndicator.style.width = `${progressPercentage}%`;

  // Highlight the checkpoints the player has reached
  checkpoints.forEach((checkpoint) => {
    const checkpointScore = parseInt(checkpoint.getAttribute("data-score"));
    if (score >= checkpointScore) {
      checkpoint.style.color = "#ff0000"; // Highlight reached checkpoints in red
    } else {
      checkpoint.style.color = "#fff"; // Reset color for unreached checkpoints
    }
  });
}


