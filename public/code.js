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

// Create a bingo card from a state, only required field is size
function createBingoCard (bingoCard, state) {
  // Update CSS
  bingoCard.style.gridTemplateColumns = "repeat(".concat(state.size, ", minmax(0, 1fr))");
  // Set the size attribute
  bingoCard.setAttribute("data-bingo-card-size", state.size);
  // Add new elements
  for (let i = 0; i < (state.size*state.size); i++) {
    const newNode = emptyBingoTile.cloneNode(true);
    bingoCard.appendChild(newNode);
    // Set contents if it is provided
    if (state.card && i < state.card.length) {
      newNode.querySelector(".bingo-text").innerText = state.card[i];
    }
    tileSetup(newNode);
  }
}

// Set up event listeners
function tileSetup(element) {
  const bingoCardContainer = element.parentElement.parentElement;
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
    createBingoCard(bingoCard, { size: sizeElement.value });
  });

  // Load: remake bingo card according to specified file
  const loadElement = bingoCardContainer.querySelector(".load");
  loadElement.addEventListener("change", () => {
    if (loadElement.files.length >= 1) {
      loadElement.files[0].text().then((v) => {
        const state = JSON.parse(v);
        removeAllChildren(bingoCard);
        createBingoCard(bingoCard, state);
      });
    }
  });

  // Save: update the link as well
  updateSaveBingoCardLink(bingoCardContainer);

  // Tile setup
  bingoCard.querySelectorAll(".bingo-item").forEach((element) => {
    tileSetup(element);
  });

  // STYLING
  // Card size
  const styleCardSizeElement = bingoCardContainer.querySelector(".style-card-size");
  styleCardSizeElement.addEventListener("change", () => {
    bingoCard.style.width = styleCardSizeElement.value.concat("px");
    bingoCard.style.height = styleCardSizeElement.value.concat("px");
  });
  // Card corner radius
  const styleCardCornerRadius = bingoCardContainer.querySelector(".style-card-corner-radius");
  styleCardCornerRadius.addEventListener("change", () => {
    bingoCard.style.borderRadius = styleCardCornerRadius.value.concat("px");
  });
  // Tile corner radius
  const styleTileCornerRadius = bingoCardContainer.querySelector(".style-tile-corner-radius");
  styleCardCornerRadius.addEventListener("change", () => {
    // TODO
  });
}
// Set up controls when app starts
document.querySelectorAll(".bingo-card-container").forEach((element) => {
  setUpBingoCardControls(element);
});

