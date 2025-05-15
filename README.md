# Hungry Memory Game 4x4

A beautiful vintage-style memory card game built with HTML, CSS, and JavaScript. Match pairs of cards to win! Features a unique animation where non-matching cards physically swap positions before flipping back.

## Features

- 4x4 grid memory game with vintage aesthetic
- Card swapping animation for non-matching pairs
- Score tracking with moves counter
- Game timer
- Responsive design for mobile and desktop
- Animated card flips and victory celebration
- Victory modal with sharing options
- Preloaded images for smoother gameplay

## Live Demo

[Play the game here](https://game.howtorebuildcivilization.com/)

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Custom animations without external libraries

## Animation Features

- Matching cards stay flipped
- Non-matching cards:
  1. Show both cards for 800ms
  2. Swap their positions (images change places)
  3. Show the swapped cards for 800ms
  4. Flip back to hidden state

## Setup

1. Clone the repository:
```bash
git clone https://github.com/your-github-username/hungry-memory-game.git
```

2. Open `index.html` in your browser to play locally, or use a local server:
```bash
python3 -m http.server 8000
```

## How to Play

1. Click on any card to flip it
2. Try to find its matching pair
3. When cards don't match, they'll swap positions before flipping back
4. Match all pairs to win
5. Try to complete the game with the fewest moves and in the shortest time

## Development

- Auto-solve functionality is available for testing but hidden from regular users
- Cards are shuffled with an improved algorithm that prevents adjacent duplicates

## License

This project is open source and available under the [MIT License](LICENSE). 