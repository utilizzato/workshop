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
  let cellPassingWordCounts = [];
  let cellStartingWordCounts = [];
  let wordsToLocations = {};
  // 🔁 Auto-load board.json on startup

  fetch('board.json')
    .then(res => res.json())
    .then(data => {
      boardSize = data.size;
      boardLetters = data.board.toUpperCase().split('');
      validWords = new Set(data.words.map(w => w.toUpperCase()));
      cellPassingWordCounts = data.cellPassingWordCounts;
      cellStartingWordCounts = data.cellStartingWordCounts;
      wordsToLocations = data.wordsToLocations;

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
    tile.dataset.index = i;
    tile.style.width = tileSize() + 'px';
    tile.style.height = tileSize() + 'px';
    tile.style.position = 'relative'; // Needed for overlay positioning

    // Main letter
    const letter = document.createElement('div');
    letter.textContent = boardLetters[i];
    letter.style.zIndex = 1;
    tile.appendChild(letter);

    // Word count badge
const passingCount = document.createElement('div');
passingCount.textContent = cellPassingWordCounts[i] ?? '';
passingCount.style.position = 'absolute';
passingCount.style.bottom = '2px';
passingCount.style.left = '4px';
passingCount.style.fontSize = '10px';
passingCount.style.color = '#000';
passingCount.style.opacity = 0.6;
passingCount.style.zIndex = 2;


const startingCount = document.createElement('div');
startingCount.textContent = cellStartingWordCounts[i] ?? '';
if(startingCount.textContent === "0")
  startingCount.textContent = "";
startingCount.style.position = 'absolute';
startingCount.style.bottom = '2px';
startingCount.style.right = '4px';
startingCount.style.fontSize = '10px';
startingCount.style.color = '#ff0000';
startingCount.style.opacity = 0.6;
startingCount.style.zIndex = 2;

tile.appendChild(passingCount);
tile.appendChild(startingCount);



    boardEl.appendChild(tile);
  }
}

  function tileSize() {
    return window.innerWidth < 600 ? 80 : 60;
  }

  function indexToCoord(index) {
    return [Math.floor(index / boardSize), index % boardSize];
  }

  function coordToIndex(cell)
  {
    return cell[0] * boardSize + cell[1]
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
      const word = selectedTiles.map(tile => tile.textContent[0]).join('').toUpperCase();
      wordDisplay.textContent = word;

      if (validWords.has(word) && !foundWords.has(word)) {
        foundWords.add(word);
        updateWordsRemaining();

        locations = wordsToLocations[String(word)]
        //console.log(locations)
        start_idx = coordToIndex(locations[0])
        let tile = document.querySelector(`.tile[data-index="${start_idx}"]`);
        if (tile.children[2].innerHTML !== "1")
          tile.children[2].innerHTML = tile.children[2].innerHTML - 1;
        else
          tile.children[2].innerHTML = "";

        for(ii in locations)
        {
          cell = locations[ii]
          idx = coordToIndex(cell)
          tile = document.querySelector(`.tile[data-index="${idx}"]`);
          if (!tile) alert("oops1");
          if (tile.children.length !== 3) alert("oops2");
          
          if (tile.children[1].innerHTML !== "1")
            tile.children[1].innerHTML = tile.children[1].innerHTML - 1;
          else
            {
              tile.children[1].innerHTML = "";
              tile.style.opacity = '0.1';
            }
          
        }

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
