document.addEventListener('DOMContentLoaded', () => {
  const boardEl = document.getElementById('board');
  const wordDisplay = document.getElementById('wordDisplay');
  const wordsRemainingDisplay = document.getElementById('wordsRemaining');

  let boardSize = 4;
  let boardLetters = [];
  let validWords = new Set();
  let foundWords = new Set();
  let selectedTiles = [];
  let selectedPositions = new Set();
  let isMouseDown = false;

  // 🔁 Auto-load board.json on startup

  fetch('board.json')
    .then(res => res.json())
    .then(data => {
      boardSize = data.size;
      boardLetters = data.board.toUpperCase().split('');
      validWords = new Set(data.words.map(w => w.toUpperCase()));
      foundWords.clear();

      if (boardLetters.length !== boardSize * boardSize) {
        alert("Board letter count doesn't match size.");
        return;
      }

      updateWordsRemaining();
      generateBoard();
    })
    .catch(err => {
      alert("Failed to load board.json");
      console.error(err);
    });

  function generateBoard() {
    boardEl.innerHTML = '';
    boardEl.style.gridTemplateColumns = `repeat(${boardSize}, ${tileSize()}px)`;

    for (let i = 0; i < boardSize * boardSize; i++) {
      const tile = document.createElement('div');
      tile.classList.add('tile');
      tile.textContent = boardLetters[i];
      tile.dataset.index = i;
      tile.style.width = tileSize() + 'px';
      tile.style.height = tileSize() + 'px';
      boardEl.appendChild(tile);
    }
  }

  function tileSize() {
    return window.innerWidth < 600 ? 80 : 60;
  }

  function indexToCoord(index) {
    return [Math.floor(index / boardSize), index % boardSize];
  }

  function areAdjacent(index1, index2) {
    const [r1, c1] = indexToCoord(index1);
    const [r2, c2] = indexToCoord(index2);
    return Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1 && index1 !== index2;
  }

  function selectTile(tile) {
    const index = +tile.dataset.index;
    selectedTiles.push(tile);
    selectedPositions.add(index);
    tile.classList.add('selected');
  }

  function undoLastTile() {
    const tile = selectedTiles.pop();
    if (tile) {
      tile.classList.remove('selected');
      selectedPositions.delete(+tile.dataset.index);
    }
  }

  function clearSelection() {
    selectedTiles.forEach(tile => tile.classList.remove('selected'));
    selectedTiles = [];
    selectedPositions.clear();
  }

  function updateWordsRemaining() {
    const remaining = validWords.size - foundWords.size;
    if (remaining > 0)
    {
        wordsRemainingDisplay.textContent = "Words remaining: " + remaining;
    }
    else
    {
        confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.6 }
        });
        wordsRemainingDisplay.textContent = "🎉 You found all the words!"
    }

}

  function endSelection() {
    if (isMouseDown) {
      isMouseDown = false;
      const word = selectedTiles.map(tile => tile.textContent).join('').toUpperCase();
      wordDisplay.textContent = word;

      if (validWords.has(word) && !foundWords.has(word)) {
        foundWords.add(word);
        updateWordsRemaining();
      }

      clearSelection();
    }
  }

  function getTileFromTouchEvent(e) {
    const touch = e.touches[0] || e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    return element?.classList.contains('tile') ? element : null;
  }

  // Input handling (mouse + touch)
  boardEl.addEventListener('mousedown', e => {
    if (e.target.classList.contains('tile')) {
      isMouseDown = true;
      clearSelection();
      selectTile(e.target);
    }
  });

  boardEl.addEventListener('mousemove', e => {
    if (isMouseDown && e.target.classList.contains('tile')) {
      handleTileHover(e.target);
    }
  });

  document.addEventListener('mouseup', endSelection);

  boardEl.addEventListener('touchstart', e => {
    const tile = getTileFromTouchEvent(e);
    if (tile) {
      isMouseDown = true;
      clearSelection();
      selectTile(tile);
      e.preventDefault();
    }
  }, { passive: false });

  boardEl.addEventListener('touchmove', e => {
    const tile = getTileFromTouchEvent(e);
    if (tile) {
      handleTileHover(tile);
      e.preventDefault();
    }
  }, { passive: false });

  document.addEventListener('touchend', endSelection);

  function handleTileHover(tile) {
    const index = +tile.dataset.index;
    const lastTile = selectedTiles[selectedTiles.length - 1];
    const lastIndex = +lastTile?.dataset.index;

    if (selectedTiles.length >= 2) {
      const prevTile = selectedTiles[selectedTiles.length - 2];
      const prevIndex = +prevTile.dataset.index;
      if (index === prevIndex) {
        undoLastTile();
        return;
      }
    }

    if (!selectedPositions.has(index) && areAdjacent(lastIndex, index)) {
      selectTile(tile);
    }
  }
});
