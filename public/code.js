console.log("amongus 🤨")

// 'card' is the outermost element, most commonly used
// 'grid' is the grid holding the items

// TODO: make default card also describe which styles for the different stylable
// elements should be exposed/saved

// better style mechanism
// 2 groups (card/item), array of (key: UI-item, register(element), load(element))

const defaultItemText = "\n🦆 duck";
const defaultCard = {
  size: 4,
  items: Array(16).fill({ text: defaultItemText }),
  style: {
    grid: {
      size: "400",
      backgroundColor: "lightyellow",
    },
    item: {
      backgroundColor: "lightpink",
    },
    card: {
    },
  },
}

const stylables = [ "grid", "item", "card" ];

// All allowed CSS styles first with than without camelCasing
// v: controls, e: element
const styles = [
  ["size", (e, v) => {
    const v2 =  v.concat("px");
    e.style.width = v2;
    e.style.height = v2;
  }],
  ["backgroundColor", (e, v) => {
    e.style.backgroundColor = v;
  }],
];

function applyStyle(f, e, v) {
  if (v != null) { f(e, v); }
}

// element: element to be styled
// elementName: grid/item/card
// name: name of the type of controls, say 'size'
function hookUpStyleControls(card, element, elementName, name, f) {
  const state = getState(card);
  if (state.style[elementName][name] != undefined) {
    const state = getState(card);
    const c = card.querySelector(".style-".concat(elementName).concat("-").concat(name));
    c.addEventListener("change", () => {
      // Change the styling immediately
      applyStyle(f, element, c.value);
      // Set state
      state.style[elementName][name] = c.value;
    });
  }
}

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
    state.items = state.items.concat(Array(index + 1 - state.items.length).fill({ text: defaultItemText }));
  }
  state.items[index][field] = value;
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
  const state = getState(card);

  removeAllChildren(grid);

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
    tileSetup(card, grid, newNode, state);
  }

  // Load styling
  styles.forEach(([name, f]) => {
    applyStyle(f, grid, state.style.grid[name]);
    applyStyle(f, card, state.style.card[name]);
  });
}

// Set up event listeners for a tile
function tileSetup(card, grid, element, state) {
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

  // Styling
  styles.forEach(([name, f]) => {
    // Apply from current state
    applyStyle(f, element, state.style.item[name]);
    // Register element for controls
    hookUpStyleControls(card, element, "item", name, f);
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

  // Instantiate controls
  const controls = card.querySelector(".style-template");
  stylables.forEach((stylableElementName) => {
    const newControls = controls.content.cloneNode(true);
    const newContainer = document.createElement("div");
    const heading = document.createElement("h3");
    heading.innerText = stylableElementName;
    newContainer.appendChild(heading);
    newContainer.appendChild(newControls);
    card.appendChild(newContainer);
    styles.forEach(([name, f]) => {
      const e = newContainer.querySelector(".style-".concat(name));
      if (defaultCard.style[stylableElementName][name] != undefined) {
        e.classList.add("style-".concat(stylableElementName).concat("-").concat(name));
      } else {
        // Remove elment
        console.log("goo");
        newContainer.removeChild(e);
      }
    });
  });

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

  // Styling
  styles.forEach(([name, f]) => {
    // Set up controls for the name
    hookUpStyleControls(card, grid, "grid", name, f);
    hookUpStyleControls(card, card, "card", name, f);
    // Styling for items: in tileSetup
  });
}
// Set up controls when app starts
document.querySelectorAll(".card").forEach((element) => {
  setUpBingoCardControls(element);
});

