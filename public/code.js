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
            "pixelSize": "420",
            "padding": "10",
            "backgroundColor": "#fff6e0",
            "backgroundImage": "golden-banana.gif",
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
            "backgroundImage": "",
            "borderStyle": "solid",
            "borderColor": "#b5835a",
            "borderRadius": "5"
        },
        "crossed": {
            "padding": "3",
            "fontSize": "18",
            "backgroundColor": "#ffffff",
            "backgroundImage": "",
            "borderStyle": "solid",
            "borderColor": "#b5835a",
            "borderRadius": "5"
        },
        "card": {}
    }
}

// The names of the stylable elements
const stylables = [
  ["grid",    c => c.querySelectorAll(".grid")] ,
  ["card",    c => [c]],
  ["item",    c => c.querySelectorAll(".bingo-item:not(crossed)")],
  ["crossed", c => c.querySelectorAll(".crossed")]
];


// IDEA: state -> DOM, state -> control, control -> state

// All allowed CSS styles in camel casing followed by a function applying
// and a function taking state applying it to the controls
// a value to the given stylable element
// v: value, e: element
const controls = [
  // Styles
  ["pixelSize", (card, name, c) => {
    const state = getState(card);
    const sName = getStylableName(card, c);
    const toApply = state.style[sName][name];
    forEachStylable(card, c, (s) => {
      s.style.width = toApply + "px";
      s.style.height = toApply + "px";
    });
    c.value = toApply;
  }, cToStateStyle],
  ["backgroundColor", cFromStateStyle,      cToStateStyle],
  ["backgroundImage", cFromStateStyleImage, cToStateStyleImage],
  ["fontSize",        cFromStateStylePixel, cToStateStyle],
  ["borderSpacing",   cFromStateStylePixel, cToStateStyle],
  ["borderStyle",     cFromStateStyle,      cToStateStyle],
  ["borderColor",     cFromStateStyle,      cToStateStyle],
  ["padding",         cFromStateStylePixel, cToStateStyle],
  ["borderWidth",     cFromStateStylePixel, cToStateStyle],
  ["borderRadius",    cFromStateStylePixel, cToStateStyle],

  // Controls
  ["size",      cFromState, cToState],
  ["tolerance", cFromState, cToState],
];

// Helper
function forEachStylable(card, c, f) {
  stylables.forEach(([stylableName, sF]) => {
    if (c.classList.contains("style-" + stylableName)) {
      const es = sF(card);
      es.forEach(e => {
        f(e);
      });
    }
  });
}
function getStylableName(card, c) {
  for (let i = 0; i < stylables.length; i++) {
    const [stylableName, sF] = stylables[i];
    if (c.classList.contains("style-" + stylableName)) {
      return stylableName;
    }
  }
  throw new Error('gooobagoo', c);
}

function cFromState(card, name, c) {
  c.value = getState(card)[name];
}

async function cToState(card, name, c) {
  const state = getState(card);
  state[name] = c.value;
  renderCard(card, card.querySelector(".grid"), state);
  setState(card, state);
}

function cFromStateStyle(card, name, c) {
  const state = getState(card);
  const sName = getStylableName(card, c);
  const toApply = state.style[sName][name];
  forEachStylable(card, c, (s) => {
    s.style[name] = toApply;
  });
  c.value = toApply;
}

async function cToStateStyle(card, name, c) {
  const state = getState(card);
  const sName = getStylableName(card, c);
  forEachStylable(card, c, (s) => {
    state.style[sName][name] = c.value;
  });
  setState(card, state);
}

function cFromStateStylePixel(card, name, c) {
  const state = getState(card);
  const sName = getStylableName(card, c);
  const toApply = state.style[sName][name];
  forEachStylable(card, c, (s) => {
    s.style[name] = toApply + "px";
  });
  c.value = toApply;
}

function cFromStateStyleImage(card, name, c) {
  const state = getState(card);
  const sName = getStylableName(card, c);
  const toApply = state.style[sName][name];
  forEachStylable(card, c, (s) => {
    s.style[name] = "url('" + toApply + "')";
  });
}

async function cToStateStyleImage(card, name, c) {
  const [file] = c.files;
  const url = await bytesToBase64DataUrl(file);
  const state = getState(card);
  const sName = getStylableName(card, c);
  forEachStylable(card, c, (s) => {
    state.style[sName][name] = url;
  });
  setState(card, state);
}


async function bytesToBase64DataUrl(bytes, type = "application/octet-stream") {
  return await new Promise((resolve, reject) => {
    const reader = Object.assign(new FileReader(), {
      onload: () => resolve(reader.result),
      onerror: () => reject(reader.error),
    });
    reader.readAsDataURL(new File([bytes], "", { type }));
  });
}

async function dataUrlToBytes(dataUrl) {
  const res = await fetch(dataUrl);
  return new Uint8Array(await res.arrayBuffer());
}


//  const [file] = c.files;
//  forEachStylable(card, c, (sName, s) => {
//    state[sName][name] = URL.createObjectURL(file);

// Change the text size to fit in the container
function fitText(state, e) {
  const tolerance = parseFloat(state.tolerance);
  const size = parseInt(state.size);
  const gridSize = parseInt(state.style.grid.pixelSize);
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

// Padds the list if new index is used
function getItemState(card, index, field) {
  const state = getState(card);
  // Fill in needed intries if new text is added
  if (index >= state.items.length) {
    let additionalItems = Array(index + 1 - state.items.length);
    for (let i = 0; i < additionalItems.length; i++) {
      additionalItems[i] = { text: defaultItemText };
    }
    state.items = state.items.concat(additionalItems);
  }
  return state.items[index][field];
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

  // Fit text
  card.querySelectorAll(".bingo-item").forEach((e) => {
    fitText(state, e);
  });

  // Make controls show the right state
  controls.forEach(([name, fromState, toState]) => {
    const cs = card.querySelectorAll("." + name);
    cs.forEach((c) => {
      fromState(card, name, c, state);
    });
  });
}

// Set up event listeners for a tile
function tileSetup(card, grid, element, state, index) {
  // Crossing
  element.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    if (getItemState(card, index, "crossed")) {
      element.classList.remove("crossed");
      setItemState(card, index, "crossed", false);
    } else {
      element.classList.add("crossed");
      setItemState(card, index, "crossed", true);
    }
    renderCard(card, grid, getState(card));
  });
  // Update save link on change
  textElement = element.querySelector(".bingo-text");
  textElement.addEventListener("input", (e) => {
    // Update the state
    setItemState(card, index, "text", e.currentTarget.innerText);
    updateSaveBingoCardLink(card, state);
    fitText(getState(card), element);
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
  const styleTemplate = card.querySelector(".style-template");
  stylables.forEach(([stylableElementName, sF]) => {
    const newControls = styleTemplate.content.cloneNode(true);
    const newContainer = document.createElement("div");
    const heading = document.createElement("h3");
    heading.innerText = stylableElementName;
    newContainer.appendChild(heading);
    newContainer.appendChild(newControls);
    card.appendChild(newContainer);
    newContainer.querySelectorAll(".style").forEach((c) => {
      const name = c.classList[1];
      if (defaultCard.style[stylableElementName][name] != undefined) {
        // Which element it styles
        c.classList.add("style-" + stylableElementName);
      } else {
        newContainer.removeChild(c.parentElement);
      }
    });
  });

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
      });
    }
  });
  // clear previous selections
  loadElement.value = "";

  // Save: update the link as well
  updateSaveBingoCardLink(card, defaultCard);

  // Hook up controls
  controls.forEach(([name, fromState, toState]) => {
    const cs = card.querySelectorAll("." + name);
    cs.forEach((c) => {
      c.addEventListener("change", () => {
        // Set state
        toState(card, name, c).then(() => {
          const state = getState(card);
          // Affect the DOM
          fromState(card, name, c);
          // Update link
          updateSaveBingoCardLink(card, state);
        });
      });
    });
  });
}
// Set up controls when app starts
document.querySelectorAll(".card").forEach((element) => {
  setUpBingoCardControls(element);
});

