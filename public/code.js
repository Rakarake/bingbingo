console.log("amongus 🤨")

// Get text from bingo card
// Ordering works, according to spec
function getBingoCardState (bingoCard) {
  const entries = [];
  bingoCard.querySelectorAll(".bingo-text").forEach((bingoEntry) => {
    entries.push(bingoEntry.innerText);
  });
  return entries;
}

// Update the link that downloads the bingo card state
function updateSaveBingoCardLink (bingoCardContainer) {
  const bingoCard = bingoCardContainer.querySelector(".bingo-card");
  const saveElement = bingoCardContainer.querySelector(".save");
  const json = {
    card: getBingoCardState(bingoCardContainer),
    size: bingoCard.getAttribute("data-bingo-card-size"),
  };
  const jsonString = JSON.stringify(json);
  const blob = new Blob([jsonString], { type: 'application/json' });
  saveElement.href = URL.createObjectURL(blob);
  saveElement.download = 'bingo-card.json';  // Filename of download
}

// Bingo element to use when generating new bingo cards
const emptyBingoTile = document.createElement("div");
emptyBingoTile.classList.add("bingo-item");
const emptyBingoTileText = document.createElement("div");
emptyBingoTileText.innerText = "🦆";
emptyBingoTileText.classList.add("bingo-text");
emptyBingoTileText.setAttribute("contenteditable", "true");
emptyBingoTile.append(emptyBingoTileText);

// Create a bingo card of a size
// Optional argument of the contents of the elements
function createBingoCard (bingoCard, size, contents) {
  // Update CSS
  bingoCard.style.gridTemplateColumns = "repeat(".concat(size, ", minmax(0, 1fr))");
  // Set the size attribute
  bingoCard.setAttribute("data-bingo-card-size", size);
  // Add new elements
  for (let i = 0; i < (size*size); i++) {
    const newNode = emptyBingoTile.cloneNode(true);
    bingoCard.appendChild(newNode);
    // Set contents if it is provided
    if (contents && i < contents.length) {
      newNode.innerText = contents[i];
    }
  }
}

// Helper
function removeAllChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

// Set up all functionality for bingo card controls
function setUpBingoCardControls(bingoCardContainer) {
  const bingoCard = bingoCardContainer.querySelector(".bingo-card");

  // Size: remake bingo card when size is changed
  const sizeElement = bingoCardContainer.querySelector(".size");
  sizeElement.addEventListener("change", () => {
    removeAllChildren(bingoCard);
    createBingoCard(bingoCard, sizeElement.value);
    setUpBingoCardControls(bingoCardContainer);
  });

  // Load: remake bingo card according to specified file
  const loadElement = bingoCardContainer.querySelector(".load");
  loadElement.addEventListener("change", () => {
    if (loadElement.files.length >= 1) {
      loadElement.files[0].text().then((v) => {
        const state = JSON.parse(v);
        removeAllChildren(bingoCard);
        createBingoCard(bingoCard, state.size, state.card);
        setUpBingoCardControls(bingoCardContainer);
      });
    }
  });

  // Save: update the link as well
  updateSaveBingoCardLink(bingoCardContainer);

  // Tile setup
  bingoCard.querySelectorAll(".bingo-item").forEach((element) => {
    // Crossing
    element.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      if (!element.classList.contains("crossed")) {
        element.classList.add("crossed");
      } else {
        element.classList.remove("crossed");
      }
    });
    // Update save link on change
    element.querySelector(".bingo-text").addEventListener("input", () => {
      updateSaveBingoCardLink(bingoCardContainer);
    });
  });
}
// Set up controls when app starts
document.querySelectorAll(".bingo-card-container").forEach((element) => {
  setUpBingoCardControls(element);
});

