console.log("amongus 🤨")

// 'card' is the outermost element, most commonly used
// 'grid' is the grid holding the items

const defaultItemText = "\n🦆 duck";
const defaultCard = {
  "size": 4,
  "items": Array(16).fill({ text: defaultItemText }),
  "style-width": "400px",
  "style-height": "400px",
}

// All allowed CSS styles first with than without camelCasing
const styles = [
  "width",
  "height",
  "backgroundColor",
  "cornerRadius",
];

function getState(card) {
  return JSON.parse(card.dataset.state);
}
function setState(card, state) {
  card.dataset.state = JSON.stringify(state);
}

function getCardState(card, field) { return getState(card)[field]; }
function getItemState(card, index, field) { return getState(card)[index][field]; }

function setCardState(card, field, value) {
  const state = getState(card);
  state[field] = value;
  setState(card, state);
}
function setItemState(card, index, field, value) {
  const state = getState(card);
  // Fill in needed intries if new text is added
  if (index >= state.items.length) {
    console.log("goo", index, state.items.length, index + 1 - state.items.length);
    state.items = state.items.concat(Array(index + 1 - state.items.length).fill({ text: defaultItemText }));
  }
  state.items[index][field] = value;
  console.log(index, field, value);
  setState(card, state);
}

// Update the link that saves your bingo card
function updateSaveBingoCardLink (card) {
  const saveElement = card.querySelector(".save");
  const jsonString = JSON.stringify(getState(card));
  const blob = new Blob([jsonString], { type: 'application/json' });
  saveElement.href = URL.createObjectURL(blob);
  saveElement.download = 'bingo-card.json';  // Filename of download
}

// Bingo element to use when generating new bingo cards
const emptyBingoTile = document.createElement("div");
emptyBingoTile.classList.add("bingo-item");
const emptyBingoTileText = document.createElement("div");
emptyBingoTileText.classList.add("bingo-text");
emptyBingoTileText.setAttribute("contenteditable", "true");
emptyBingoTile.append(emptyBingoTileText);

// Create a bingo card from state
function renderCard (card, grid) {
  removeAllChildren(grid);
  const state = getState(card);

  // Set the number of rows/columns
  grid.style.gridTemplateColumns = "repeat(".concat(state.size, ", minmax(0, 1fr))");

  // Add new elements
  for (let i = 0; i < (state.size * state.size); i++) {
    const newNode = emptyBingoTile.cloneNode(true);
    grid.appendChild(newNode);
    // Set contents if it is provided
    if (i < state.items.length) {
      newNode.querySelector(".bingo-text").innerText = state.items[i].text;
    } else {
      newNode.querySelector(".bingo-text").innerText = defaultItemText;
    }
    tileSetup(card, grid, newNode);
  }

  // Load styling
  styles.forEach((s1) => {
    const styleValue = state["style-".concat(s1)];
    if (styleValue) {
      grid.style[s1] = styleValue;
    }
    const styleItemValue = state["styleItem-".concat(s1)];
    if (styleItemValue) {
      for (child of grid.children) {
        child.style[s1] = styleItemValue;
      }
    }
  });
}

// Set up event listeners for a tile
function tileSetup(card, grid, element) {
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
  textElement = element.querySelector(".bingo-text");
  textElement.addEventListener("input", (e) => {
    // Update the state
    const index = Array.from(grid.children).indexOf(element);
    setItemState(card, index, "text", e.currentTarget.innerText);
    updateSaveBingoCardLink(card);
  });
}

// Helper
function removeAllChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

// Set up all functionality for bingo card controls
function setUpBingoCardControls(card) {
  const grid = card.querySelector(".grid");

  // Create empty bingo card
  setState(card, defaultCard);
  renderCard(card, grid);

  // Size: remake bingo card when size is changed
  const sizeElement = card.querySelector(".size");
  sizeElement.addEventListener("change", () => {
    const newSize = sizeElement.value;
    setCardState(card, "size", newSize);
    renderCard(card, grid);
  });

  // Load: remake bingo card according to specified file
  const loadElement = card.querySelector(".load");
  loadElement.addEventListener("change", () => {
    if (loadElement.files.length >= 1) {
      loadElement.files[0].text().then((v) => {
        const state = JSON.parse(v);
        setState(card, state);
        renderCard(card, grid);
      });
    }
  });

  // Save: update the link as well
  updateSaveBingoCardLink(card);

  // STYLING
  // Card size
  styles.forEach((s1) => {
    const element = card.querySelector(".style-".concat(s1));
    element.addEventListener("change", () => {
      setCardState(card, "style-".concat(s1), element.value);
      grid.style[s1] = element.value;
    });
  });
}
// Set up controls when app starts
document.querySelectorAll(".card").forEach((element) => {
  setUpBingoCardControls(element);
});

