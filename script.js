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

const board = document.getElementById('game-board');
const moveCounter = document.getElementById('move-counter');
const timerDisplay = document.getElementById('timer');
const restartBtn = document.getElementById('restart-btn');
const victoryModal = document.getElementById('victory-modal');
const victoryMessage = document.getElementById('victory-message');
const restartModalBtn = document.getElementById('restart-modal-btn');
const shareInstagramBtn = document.getElementById('share-instagram');
const shareFacebookBtn = document.getElementById('share-facebook');

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

  // Remove JS override of gridTemplateColumns/Rows so CSS controls layout
  // board.style.gridTemplateColumns = 'repeat(8, 1fr)';
  // board.style.gridTemplateRows = 'repeat(2, 1fr)';

  cards = cardImages.map((cardObj, idx) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.symbol = cardObj.id;
    card.dataset.index = idx;
    card.innerHTML = `
      <div class=\"card-inner\">
        <div class=\"card-front\"><img src=\"${cardObj.img}\" alt=\"Memory Card\" draggable=\"false\"></div>
        <div class=\"card-back\">?</div>
      </div>
    `;
    card.addEventListener('click', () => handleCardClick(card));
    board.appendChild(card);
    return card;
  });
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
}

function restartGame() {
  victoryModal.classList.add('hidden');
  createBoard();
}

restartBtn.addEventListener('click', restartGame);
restartModalBtn.addEventListener('click', restartGame);

shareInstagramBtn.addEventListener('click', function() {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent('Check out my score in HUNGRY Memory Game!');
  // Instagram does not support direct share, so copy to clipboard and alert
  navigator.clipboard.writeText(`${text} ${url}`);
  alert('Instagram does not support direct sharing. The message has been copied to your clipboard. Paste it in your Instagram story or post!');
});

shareFacebookBtn.addEventListener('click', function() {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent('Check out my score in HUNGRY Memory Game!');
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
});

// Start the game on load
createBoard(); 