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

// Function to auto-solve the game directly
function autoSolveGame() {
  console.log("Auto-solving game...");
  
  if (!gameStarted) {
    gameStarted = true;
    startTimer();
  }
  
  // Force match all cards
  for (let i = 0; i < cards.length; i++) {
    cards[i].classList.add('flipped');
    cards[i].classList.add('matched');
  }
  
  // Update matched count
  matchedCount = 16;
  
  // Add some moves for realism
  moves += 3;
  moveCounter.textContent = `Moves: ${moves}`;
  
  // Stop the timer
  clearInterval(timerInterval);
  
  // Show victory screen after 2-second delay
  setTimeout(endGame, 2000);
}

// Preload all images before starting the game
function preloadImages(callback) {
  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'loading-indicator';
  loadingIndicator.innerHTML = `
    <div class="loading-spinner"></div>
    <div class="loading-text">Preparing your game... <span id="loading-progress">0</span>%</div>
  `;
  document.querySelector('.game-container').prepend(loadingIndicator);
  
  imagesLoaded = 0;
  
  // Create image objects and preload them
  imagePaths.forEach((path) => {
    const img = new Image();
    img.onload = () => {
      imagesLoaded++;
      // Calculate percentage instead of showing count
      const percentage = Math.round((imagesLoaded / totalImages) * 100);
      document.getElementById('loading-progress').textContent = percentage;
      
      if (imagesLoaded === totalImages) {
        // All images loaded
        document.getElementById('loading-progress').textContent = '100';
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
      // Calculate percentage for errors too
      const percentage = Math.round((imagesLoaded / totalImages) * 100);
      document.getElementById('loading-progress').textContent = percentage;
      
      if (imagesLoaded === totalImages) {
        document.getElementById('loading-progress').textContent = '100';
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

// Improved shuffling algorithm that avoids adjacent duplicates
function improvedShuffle(array) {
  // First do a standard Fisher-Yates shuffle
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  
  // Check for adjacent duplicates and fix if found
  let needsReshuffle = true;
  let attempts = 0;
  const maxAttempts = 10; // Prevent infinite loops
  
  while (needsReshuffle && attempts < maxAttempts) {
    needsReshuffle = false;
    attempts++;
    
    // Check entire array for adjacent duplicates
    for (let i = 0; i < array.length - 1; i++) {
      if (array[i].id === array[i + 1].id) {
        // Find a non-adjacent position to swap with
        let swapIndex = -1;
        
        // Look for a safe position to swap with (not creating new adjacencies)
        for (let j = i + 2; j < array.length; j++) {
          if (array[j].id !== array[i].id && 
              (j === array.length - 1 || array[j].id !== array[j + 1].id) &&
              (j < array.length - 1 || array[j].id !== array[0].id)) {
            swapIndex = j;
            break;
          }
        }
        
        // If no safe position found, look for any non-adjacent position
        if (swapIndex === -1) {
          for (let j = i + 2; j < array.length; j++) {
            if (array[j].id !== array[i].id) {
              swapIndex = j;
              break;
            }
          }
        }
        
        // Swap if position found
        if (swapIndex !== -1) {
          [array[i + 1], array[swapIndex]] = [array[swapIndex], array[i + 1]];
          needsReshuffle = true; // Check again after swap
          break;
        }
      }
    }
    
    // Check for wrap-around adjacent duplicates (last and first)
    if (array[array.length - 1].id === array[0].id) {
      // Find a position to swap with
      let swapIndex = -1;
      for (let j = 1; j < array.length - 1; j++) {
        if (array[j].id !== array[array.length - 1].id && 
            array[j].id !== array[j - 1].id && 
            array[j].id !== array[j + 1].id) {
          swapIndex = j;
          break;
        }
      }
      
      if (swapIndex !== -1) {
        [array[0], array[swapIndex]] = [array[swapIndex], array[0]];
        needsReshuffle = true;
      }
    }
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
  
  // Use improved shuffle algorithm instead of regular shuffle
  cardImages = improvedShuffle(cardImages);

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

// Helper to swap two DOM nodes
function swapDomNodes(nodeA, nodeB) {
  const parent = nodeA.parentNode;
  const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;
  parent.insertBefore(nodeA, nodeB);
  parent.insertBefore(nodeB, siblingA);
}

// Helper to create a placeholder in the grid
function createPlaceholder(card) {
  const placeholder = document.createElement('div');
  placeholder.className = 'card-placeholder';
  placeholder.style.width = card.offsetWidth + 'px';
  placeholder.style.height = card.offsetHeight + 'px';
  card.parentNode.insertBefore(placeholder, card);
  return placeholder;
}

function handleCardClick(card) {
  if (
    card.classList.contains('flipped') ||
    card.classList.contains('matched') ||
    flippedCards.length === 2 ||
    board.classList.contains('input-blocked')
  ) {
    return;
  }

  if (!gameStarted) {
    gameStarted = true;
    startTimer();
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
    // Cards match
    card1.classList.add('matched');
    card2.classList.add('matched');
    matchedCount += 2;
    flippedCards = [];
    if (matchedCount === 16) {
      clearInterval(timerInterval);
      setTimeout(endGame, 2000);
    }
    return;
  }

  // Block input during animation
  board.classList.add('input-blocked');
  
  // Get the images and their data
  const img1 = card1.querySelector('.card-front img');
  const img2 = card2.querySelector('.card-front img');
  const img1Src = img1.src;
  const img2Src = img2.src;
  const symbol1 = card1.dataset.symbol;
  const symbol2 = card2.dataset.symbol;
  const index1 = parseInt(card1.dataset.index);
  const index2 = parseInt(card2.dataset.index);
  
  // Simple swap with delay to view the cards first
  setTimeout(() => {
    // Swap the card images directly - no animation, just update the source
    img1.src = img2Src;
    img2.src = img1Src;
    
    // Swap the data attributes
    card1.dataset.symbol = symbol2;
    card2.dataset.symbol = symbol1;
    
    // Update logical cards array
    [cards[index1], cards[index2]] = [cards[index2], cards[index1]];
    
    // Pause to let player see the swap
    setTimeout(() => {
      // Flip back the cards
      card1.classList.add('flip-back');
      card2.classList.add('flip-back');
      
      // Remove classes and unblock input after flip animation
      setTimeout(() => {
        card1.classList.remove('flipped', 'flip-back');
        card2.classList.remove('flipped', 'flip-back');
        flippedCards = [];
        board.classList.remove('input-blocked');
      }, 500); // flip back duration
    }, 800); // time to see the swapped cards
  }, 800); // time to see original cards
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
  const colors = ['blue', 'pink', 'yellow', 'cyan', 'red', 'green', 'purple', 'orange'];
  const specialTypes = ['star', 'serpentine', 'curly'];
  const rotations = [15, 30, 45, 60, -15, -30, -45, -60];
  
  // Create more confetti for a fuller effect
  for (let i = 0; i < 100; i++) {
    const dot = document.createElement('div');
    
    // Randomly choose between regular confetti and special types
    const useSpecialType = Math.random() > 0.7; // 30% chance for special types
    
    if (useSpecialType) {
      // Use a special type (star, serpentine, or curly)
      const specialType = specialTypes[Math.floor(Math.random() * specialTypes.length)];
      dot.className = `confetti-dot ${specialType}`;
    } else {
      // Use a regular color confetti
      const colorClass = colors[Math.floor(Math.random() * colors.length)];
      dot.className = `confetti-dot ${colorClass}`;
    }
    
    // Position randomly across the screen
    dot.style.left = `${Math.random() * 100}%`;
    
    // Random delay for more natural effect
    const delay = Math.random() * 6;
    dot.style.animationDelay = `${delay}s`;
    
    // Random animation duration for variation (20% faster)
    const duration = 4 + Math.random() * 4.8; // 20% faster
    dot.style.animationDuration = `${duration}s`;
    
    // Set random rotation angle
    const rotate = rotations[Math.floor(Math.random() * rotations.length)];
    dot.style.setProperty('--rotate', `${rotate}deg`);
    
    // Set random sway amounts
    const swayAmount = 50 + Math.random() * 100;
    dot.style.setProperty('--sway-left', `${-swayAmount}px`);
    dot.style.setProperty('--sway-right', `${swayAmount}px`);
    
    confettiBg.appendChild(dot);
  }
}

function restartGame() {
  victoryModal.classList.add('hidden');
  preloadImages(() => {
    createBoard();
  });
}

// Function to simulate a more dynamic sharing experience
function captureVictoryScreen() {
  // In a full implementation, we would use html2canvas or a similar library
  // to capture the actual victory screen with the player's stats
  console.log("Capturing victory screen for sharing...");
  
  // For now, we'll use the static image and dynamic text in the share dialog
  return window.location.origin + '/Images/share-image.jpg';
}

// Function to handle Facebook sharing
function shareToFacebook(gameUrl, text) {
  // For better debugging to see what's being shared
  console.log("Sharing to Facebook:", {gameUrl, text});
  
  try {
    // Open Facebook's share dialog in a new tab
    const url = encodeURIComponent(gameUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    
    // Since Facebook doesn't allow pre-populating the text field,
    // we'll provide instructions to the user
    setTimeout(() => {
      alert(`Please paste this text into your Facebook post:\n\n${text}`);
    }, 500);
  } catch (error) {
    console.error("Error sharing to Facebook:", error);
    alert("There was an error opening the Facebook share dialog. Please try again.");
  }
}

// Set up all event listeners
restartBtn.addEventListener('click', restartGame);
restartModalBtn.addEventListener('click', restartGame);

shareFacebookBtn.addEventListener('click', function() {
  // Game URL - replace with actual production URL when deployed
  const gameUrl = 'https://game.howtorebuildcivilization.com/';
  
  // Create a dynamic message with the player's actual stats
  const shareText = `Just got this resolved in ${moves} moves and ${timer} seconds. Wanna try? Here it is: Hungry Memory Game - ${gameUrl}`;
  
  // Create an overlay with copy instructions
  const overlay = document.createElement('div');
  overlay.className = 'share-overlay';
  overlay.innerHTML = `
    <div class="share-modal">
      <h3>Share Your Achievement</h3>
      <p>Copy this text to share on Facebook:</p>
      <textarea class="share-text" readonly>${shareText}</textarea>
      <div class="share-buttons">
        <button id="copy-btn" class="copy-btn">Copy Text</button>
        <button id="continue-share-btn" class="continue-btn">Continue to Facebook</button>
        <button id="cancel-share-btn" class="cancel-btn">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  
  // Select the text in the textarea
  const textarea = overlay.querySelector('.share-text');
  textarea.focus();
  textarea.select();
  
  // Add event listeners
  overlay.querySelector('#copy-btn').addEventListener('click', function() {
    // Copy the text
    textarea.select();
    document.execCommand('copy');
    
    // Show success message
    this.textContent = 'Copied!';
    setTimeout(() => {
      this.textContent = 'Copy Text';
    }, 2000);
  });
  
  overlay.querySelector('#continue-share-btn').addEventListener('click', function() {
    // Copy the text automatically before continuing
    textarea.select();
    document.execCommand('copy');
    
    // Remove the overlay
    document.body.removeChild(overlay);
    
    // Share to Facebook
    shareToFacebook(gameUrl, shareText);
  });
  
  overlay.querySelector('#cancel-share-btn').addEventListener('click', function() {
    // Remove the overlay
    document.body.removeChild(overlay);
  });
});

// Add meta tags for better sharing
function addSocialMetaTags() {
  // Only add these tags if they don't already exist
  if (!document.querySelector('meta[property="og:title"]')) {
    const metaTags = [
      { property: 'og:title', content: 'Hungry Memory Game' },
      { property: 'og:description', content: 'Challenge your memory with this beautiful vintage memory card game!' },
      { property: 'og:image', content: window.location.origin + '/Images/share-image.jpg' },
      { property: 'og:url', content: window.location.href },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' }
    ];
    
    metaTags.forEach(tag => {
      const meta = document.createElement('meta');
      if (tag.property) {
        meta.setAttribute('property', tag.property);
      } else {
        meta.setAttribute('name', tag.name);
      }
      meta.setAttribute('content', tag.content);
      document.head.appendChild(meta);
    });
  }
}

// Set auto-resolve button
document.addEventListener('DOMContentLoaded', function() {
  // Add social sharing meta tags
  addSocialMetaTags();
  
  // Start the game
  preloadImages(() => {
    createBoard();
  });
}); 