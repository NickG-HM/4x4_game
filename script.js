// Image paths for 8 pairs, each will appear 2 times for 16 cards
const imagePaths = [
  'Images/Memo-1.png',
  'Images/Memo-2.png',
  'Images/Memo-3.png',
  'Images/Memo-4.png',
  'Images/Memo-5.png',
  'Images/Memo-6.png',
  'Images/Memo-7.png',
  'Images/Memo-8.png'
];
let cards = [];
let flippedCards = [];
let matchedCount = 0;
let moves = 0;
let timer = 0;
let timerInterval = null;
let gameStarted = false;
let imagesLoaded = 0;
let totalImages = imagePaths.length;

const board = document.getElementById('game-board');
const moveCounter = document.getElementById('move-counter');
const timerDisplay = document.getElementById('timer');
const restartBtn = document.getElementById('restart-btn');
const victoryModal = document.getElementById('victory-modal');
const victoryMessage = document.getElementById('victory-message');
const restartModalBtn = document.getElementById('restart-modal-btn');
const shareFacebookBtn = document.getElementById('share-facebook');

// Preload all images before starting the game
function preloadImages(callback) {
  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'loading-indicator';
  loadingIndicator.innerHTML = `
    <div class="loading-spinner"></div>
    <div class="loading-text">Loading game assets... <span id="loading-progress">0</span>/${totalImages}</div>
  `;
  document.querySelector('.game-container').prepend(loadingIndicator);
  
  imagesLoaded = 0;
  
  // Create image objects and preload them
  imagePaths.forEach((path) => {
    const img = new Image();
    img.onload = () => {
      imagesLoaded++;
      document.getElementById('loading-progress').textContent = imagesLoaded;
      
      if (imagesLoaded === totalImages) {
        // All images loaded
        loadingIndicator.classList.add('fade-out');
        setTimeout(() => {
          loadingIndicator.remove();
          if (callback) callback();
        }, 500);
      }
    };
    img.onerror = () => {
      console.error(`Failed to load image: ${path}`);
      imagesLoaded++;
      document.getElementById('loading-progress').textContent = imagesLoaded;
      
      if (imagesLoaded === totalImages) {
        loadingIndicator.classList.add('fade-out');
        setTimeout(() => {
          loadingIndicator.remove();
          if (callback) callback();
        }, 500);
      }
    };
    img.src = path;
  });
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createBoard() {
  // Reset state
  board.innerHTML = '';
  flippedCards = [];
  matchedCount = 0;
  moves = 0;
  timer = 0;
  gameStarted = false;
  moveCounter.textContent = 'Moves: 0';
  timerDisplay.textContent = 'Time: 0s';
  clearInterval(timerInterval);

  // Prepare and shuffle cards (8 images, 2 of each = 16 cards)
  let cardImages = [];
  imagePaths.forEach((img, idx) => {
    for (let i = 0; i < 2; i++) {
      cardImages.push({ img, id: idx });
    }
  });
  cardImages = shuffle(cardImages);

  cards = cardImages.map((cardObj, idx) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.symbol = cardObj.id;
    card.dataset.index = idx;
    
    // Optimize image loading with loading="lazy" and decoding="async"
    card.innerHTML = `
      <div class=\"card-inner\">
        <div class=\"card-front\">
          <img src=\"${cardObj.img}\" alt=\"Memory Card\" draggable=\"false\" loading=\"lazy\" decoding=\"async\">
        </div>
        <div class=\"card-back\">?</div>
      </div>
    `;
    
    card.addEventListener('click', () => handleCardClick(card));
    board.appendChild(card);
    return card;
  });

  // Create the Auto-complete button but make it hidden
  let autoCompleteBtn = document.getElementById('auto-complete-btn');
  if (!autoCompleteBtn) {
    autoCompleteBtn = document.createElement('button');
    autoCompleteBtn.id = 'auto-complete-btn';
    autoCompleteBtn.textContent = 'Auto-complete';
    autoCompleteBtn.className = 'btn-outline';
    autoCompleteBtn.setAttribute('aria-label', 'Auto-complete (for testing)');
    
    // Hide the button visually but keep it functional for testing if needed
    autoCompleteBtn.style.position = 'absolute';
    autoCompleteBtn.style.opacity = '0';
    autoCompleteBtn.style.pointerEvents = 'none';
    autoCompleteBtn.style.width = '1px';
    autoCompleteBtn.style.height = '1px';
    autoCompleteBtn.style.overflow = 'hidden';
    autoCompleteBtn.style.clip = 'rect(0 0 0 0)';
    autoCompleteBtn.style.margin = '-1px';
    autoCompleteBtn.style.padding = '0';
    
    autoCompleteBtn.addEventListener('click', () => {
      cards.forEach(card => {
        card.classList.add('flipped', 'matched');
      });
      matchedCount = 16;
      moves++;
      moveCounter.textContent = `Moves: ${moves}`;
      clearInterval(timerInterval);
      setTimeout(endGame, 500);
    });
    
    // Still add the button to the DOM, but invisibly
    const headline = document.querySelector('.game-container h1');
    headline.insertAdjacentElement('afterend', autoCompleteBtn);
  }
}

function handleCardClick(card) {
  if (
    card.classList.contains('flipped') ||
    card.classList.contains('matched') ||
    flippedCards.length === 2
  ) {
    return;
  }

  if (!gameStarted) {
    startTimer();
    gameStarted = true;
  }

  card.classList.add('flipped');
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    moves++;
    moveCounter.textContent = `Moves: ${moves}`;
    checkForMatch();
  }
}

function checkForMatch() {
  const [card1, card2] = flippedCards;
  if (card1.dataset.symbol === card2.dataset.symbol) {
    card1.classList.add('matched');
    card2.classList.add('matched');
    matchedCount += 2;
    flippedCards = [];
    if (matchedCount === 16) {
      endGame();
    }
  } else {
    setTimeout(() => {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      flippedCards = [];
    }, 1000);
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    timer++;
    timerDisplay.textContent = `Time: ${timer}s`;
  }, 1000);
}

function endGame() {
  clearInterval(timerInterval);
  victoryMessage.textContent = `You won in ${moves} moves and ${timer} seconds!`;
  victoryModal.classList.remove('hidden');
  
  // Clear any existing confetti
  const confettiBg = document.querySelector('.confetti-bg');
  confettiBg.innerHTML = '';
  
  // Add confetti elements to match the screenshot
  const colors = ['blue', 'pink', 'yellow', 'cyan', 'red'];
  const rotations = [15, 30, 45, 60, -15, -30, -45];
  
  // Create more confetti for a fuller effect
  for (let i = 0; i < 50; i++) {
    const dot = document.createElement('div');
    const colorClass = colors[Math.floor(Math.random() * colors.length)];
    dot.className = `confetti-dot ${colorClass}`;
    
    // Position randomly across the screen
    dot.style.left = `${Math.random() * 100}%`;
    
    // Random delay for more natural effect
    const delay = Math.random() * 8;
    dot.style.animationDelay = `${delay}s`;
    
    // Set random rotation angle
    const rotate = rotations[Math.floor(Math.random() * rotations.length)];
    dot.style.setProperty('--rotate', `${rotate}deg`);
    
    confettiBg.appendChild(dot);
  }
}

function restartGame() {
  victoryModal.classList.add('hidden');
  preloadImages(() => {
    createBoard();
  });
}

restartBtn.addEventListener('click', restartGame);
restartModalBtn.addEventListener('click', restartGame);

shareFacebookBtn.addEventListener('click', function() {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent('Check out my score in HUNGRY Memory Game!');
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
});

// Start the game after preloading images
window.addEventListener('DOMContentLoaded', () => {
  preloadImages(() => {
    createBoard();
  });
}); 