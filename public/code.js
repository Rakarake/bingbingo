/*
@licstart  The following is the entire license notice for the
JavaScript code in this page.


Copyright (C) 2024  Monke Defens Fors (MDF)

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU Affero General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
details.

You should have received a copy of the GNU Affero General Public License along with
this program. If not, see <https://www.gnu.org/licenses/>.


@licend  The above is the entire license notice
for the JavaScript code in this page.
*/

console.log("amongus 🤨");

// 'card' is the outermost element, most commonly used
// 'grid' is the grid holding the items
// 'item' is the tiles that make up the card

const defaultItemText = "1";

// The default card indicates which controls should be present for
// each stylable element
const defaultCard =
{
    "size": "4",
    "items": [],
    "tolerance": "0.8",
    "style": {
        "grid": {
            "size": "420",
            "padding": "10",
            "backgroundColor": "#fff6e0",
            "backgroundImage": "url('golden-banana.gif')",
            "borderSpacing": "10",
            "borderStyle": "dashed",
            "borderWidth": "5",
            "borderColor": "#facc78",
            "borderRadius": "5",
        },
        "item": {
            "padding": "3",
            "fontSize": "18",
            "backgroundColor": "#f9f06b",
            "borderStyle": "solid",
            "borderColor": "#b5835a",
            "borderRadius": "5"
        },
        "card": {}
    }
}

// The names of the stylable elements
const stylables = [ "grid", "item", "card" ];

// All allowed CSS styles in camel casing followed by a lambda applying
// a value to the given stylable element
// v: value, e: element
const styles = [
  ["size", (e, v) => {
    const v2 =  v.concat("px");
    e.style.width = v2;
    e.style.height = v2;
  }],
  ["backgroundColor", (e, v) => {
    e.style.backgroundColor = v;
  }],
  ["backgroundImage", (e, v) => {
    e.style.backgroundImage = v;
  }],
  ["fontSize", (e, v) => {
    e.style.fontSize = v + "px";
  }],
  ["borderSpacing", (e, v) => {
    e.style.borderSpacing = v + "px";
  }],
  ["borderStyle", (e, v) => {
    e.style.borderStyle = v;
  }],
  ["borderColor", (e, v) => {
    e.style.borderColor = v;
  }],
  ["padding", (e, v) => {
    e.style.padding = v + "px";
  }],
  ["borderWidth", (e, v) => {
    e.style.borderWidth = v + "px";
  }],
  ["borderRadius", (e, v) => {
    e.style.borderRadius = v + "px";
  }],
];

const controls = [
  ["size", (c, card, grid, state) => {
    state.size = c.value;
    renderCard(card, grid, state);
    return state;
  }],
  ["tolerance", (c, card, grid, state) => {
    state.tolerance = c.value;
    renderCard(card, grid, state);
    return state;
  }],
];

// Helper
function applyStyle(f, e, v) {
  if (v != null) { f(e, v); }
}

// Change the text size to fit in the container
function fitText(state, e) {
  const tolerance = parseFloat(state.tolerance);
  const size = parseInt(state.size);
  const gridSize = parseInt(state.style.grid.size);
  const borderSpacing = parseInt(state.style.grid.borderSpacing);
  const gridPadding = parseInt(state.style.grid.padding);
  const gridBorderWidth = parseInt(state.style.grid.borderWidth);
  const expected =
    (gridSize - (borderSpacing * (size + 1) + gridPadding*2 + gridBorderWidth*2))
    / size + tolerance;

  let fontSize =  Number(e.style.fontSize.substring(0, e.style.fontSize.length - 2.0));

  // Compute the biggest dimension of the rect
  const cOutlier = () => {
    const rect = e.getBoundingClientRect();
    return Math.max(rect.width, rect.height) - tolerance;
  };
  // Maximize as much as until rect grows
  while (fontSize < state.style.item.fontSize) {
    if (cOutlier() > expected) {
      break;
    }
    fontSize += 1;
    e.style.fontSize = fontSize + "px";
  }
  // Minimize until rect is the right size
  while (cOutlier() > expected && fontSize > 1) {
    fontSize -= 1;
    e.style.fontSize = fontSize + "px";
  }
}

// element: element to be styled
// elementName: grid/item/card
// name: name of the type of controls, say 'size'
function hookUpStyleControls(card, element, elementName, name, f) {
  if (getState(card).style[elementName][name] != undefined) {
    const c = card.querySelector(".style-".concat(elementName).concat("-").concat(name));
    c.addEventListener("change", () => {
      // Change the styling immediately
      applyStyle(f, element, c.value);
      // Set state
      const state = getState(card);
      state.style[elementName][name] = c.value;
      setState(card, state);
      // Update link
      updateSaveBingoCardLink(card, state);
    });
  }
}

function getState(card) {
  return JSON.parse(card.dataset.state);
}
function setState(card, state) {
  card.dataset.state = JSON.stringify(state, null, 4);
}

// Padds the list if new index is used
function setItemState(card, index, field, value) {
  const state = getState(card);
  // Fill in needed intries if new text is added
  if (index >= state.items.length) {
    let additionalItems = Array(index + 1 - state.items.length);
    for (let i = 0; i < additionalItems.length; i++) {
      additionalItems[i] = { text: defaultItemText };
    }
    state.items = state.items.concat(additionalItems);
  }
  state.items[index][field] = value;
  setState(card, state);
}

// Update the link that saves your bingo card
function updateSaveBingoCardLink (card, state) {
  const saveElement = card.querySelector(".save");
  const jsonString = JSON.stringify(state, null, 4);
  const blob = new Blob([jsonString], { type: 'application/json' });
  saveElement.href = URL.createObjectURL(blob);
  saveElement.download = 'bingo-card.json';  // Filename of download
}

// Bingo element to use when generating new bingo cards
const emptyBingoTile = document.createElement("td");
emptyBingoTile.classList.add("bingo-item");
const emptyBingoTileText = document.createElement("div");
emptyBingoTileText.classList.add("bingo-text");
emptyBingoTileText.setAttribute("contenteditable", "true");
emptyBingoTile.append(emptyBingoTileText);

// Create a bingo card from state
function renderCard (card, grid, state) {
  // Add new / remove unwanted elements
  const addChild = (parent, index) => {
    const newNode = emptyBingoTile.cloneNode(true);
    parent.appendChild(newNode);
    newNode.querySelector(".bingo-text").innerText = defaultItemText;
    tileSetup(card, grid, newNode, state, index);
  }
  const currentSize = grid.children.length;
  const newSize = state.size;
  let diff = newSize - currentSize;
  if (diff > 0) {
    // positive: add elements
    // test approach
    const rows = Array.from(grid.children);
    // Add to existing rows
    for (let i = 0; i < currentSize; i++) {
      for (let j = 0; j < diff; j++) {
        addChild(grid.children[i], i*newSize + currentSize + j);
      }
    }
    // Add new rows
    for (let i = 0; i < diff; i ++) {
      const newRow = document.createElement("tr");
      grid.appendChild(newRow);
      for (let j = 0; j < newSize; j++) {
        addChild(newRow, (currentSize+i)*newSize + j)
      }
    }
  } else {
    diff = diff * -1;
    // negative: remove elements
    // Remove rows
    for (let i = 0; i < diff; i++) {
      grid.removeChild(grid.lastChild);
    }
    // Remove elements at the end of the rows
    for (let i = 0; i < newSize; i++) {
      for (let j = 0; j < diff; j++) {
        grid.children[i].removeChild(grid.children[i].lastChild);
      }
    }
  }

  // Load text
  const allBingoText = card.querySelectorAll(".bingo-text");
  for (let i = 0; i < allBingoText.length; i++) {
    if (state.items[i] != undefined) {
      allBingoText[i].innerText = state.items[i].text;
    } else {
      allBingoText[i].innerText = defaultItemText;
    }
  }

  // Set width and height to share the available space
  card.querySelectorAll(".bingo-item").forEach((e) => {
    e.style.width = ((1.0 / state.size) * 100).toFixed(3).concat("%");
    e.style.height = ((1.0 / state.size) * 100).toFixed(3).concat("%");
  });

  // Load styling
  styles.forEach(([name, f]) => {
    applyStyle(f, grid, state.style.grid[name]);
    applyStyle(f, card, state.style.card[name]);
  });

  // Fit text
  card.querySelectorAll(".bingo-item").forEach((e) => {
    fitText(state, e);
  });
}

// Set up event listeners for a tile
function tileSetup(card, grid, element, state, index) {
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
    setItemState(card, index, "text", e.currentTarget.innerText);
    updateSaveBingoCardLink(card, state);
    fitText(getState(card), element);
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

// When loading / starting, the controls should show the right values
function setValuesOfControls(card, state) {
  // Generic controls
  controls.forEach(([name, f]) => {
    const e = card.querySelector("." + name);
    e.value = state[name];
  });
  // Styling
  stylables.forEach((stylableElementName) => {
    styles.forEach(([name, f]) => {
      const e = card.querySelector(".style-".concat(stylableElementName).concat("-").concat(name));
      if (e != undefined) {
        if (e.getAttribute("type") != "file") {
          e.value = state.style[stylableElementName][name];
        } else {
          e.value = "";
        }
      }
    });
  });
}

// Set up all functionality for bingo card controls
function setUpBingoCardControls(card) {
  const grid = card.querySelector(".grid");

  // Instantiate controls
  const styleTemplate = card.querySelector(".style-template");
  stylables.forEach((stylableElementName) => {
    const newControls = styleTemplate.content.cloneNode(true);
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
        newContainer.removeChild(e.parentElement);
      }
    });
  });
  setValuesOfControls(card, defaultCard);

  // Create empty bingo card
  setState(card, defaultCard);
  renderCard(card, grid, defaultCard);

  // Load: remake bingo card according to specified file
  const loadElement = card.querySelector(".load");
  loadElement.addEventListener("change", () => {
    if (loadElement.files.length >= 1) {
      loadElement.files[0].text().then((v) => {
        const state = JSON.parse(v);
        setState(card, state);
        renderCard(card, grid, state);
        setValuesOfControls(card, state);
      });
    }
  });
  // clear previous selections
  loadElement.value = "";

  // Save: update the link as well
  updateSaveBingoCardLink(card, defaultCard);

  // Hook up controls
  controls.forEach(([name, f]) => {
    const e = card.querySelector("." + name);
    e.addEventListener("change", () => {
      // Set state
      const newState = f(e, card, grid, getState(card));
      setState(card, newState);
      // Update link
      updateSaveBingoCardLink(card, state);
    });
  });

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

