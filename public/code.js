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

// Global state among cards!
// Mapping from card element to it's state object
const allCardState = new Map();
// Hash of the original file url is the key, blob reference is the value
const cachedFiles = new Map();

// 'card' is the outermost element, most commonly used
// 'grid' is the grid holding the items
// 'item' is the tiles that make up the card

const defaultItem = { text: "1", crossed: false, };

// The default card indicates which controls should be present for
// each stylable element, and uh, is the default card 🥴
const defaultCard =
{
    "size": "4",
    "items": null,
    "tolerance": "3",
    "style": {
        "grid": {
            "pixelSize": "420",
            "padding": "10",
            "backgroundColor": "#fff6e0",
            "backgroundImage": "",
            "borderSpacing": "10",
            "borderStyle": "dashed",
            "borderWidth": "5",
            "borderColor": "#facc78",
            "borderRadius": "5",
        },
        "item": {
            "padding": "3",
            "fontSize": "18",
            "fontFamily": { isData: false, url: "sans-serif" },
            "backgroundColor": "#ffffff",
            "backgroundImage": { isData: false, url: "" },
            "borderStyle": "solid",
            "borderColor": "#b5835a",
            "borderRadius": "5"
        },
        "crossed": {
            "padding": "3",
            "fontSize": "18",
            "fontFamily": { isData: false, url: "sans-serif" },
            "backgroundColor": "#ffffff",
            "backgroundImage": { isData: false, url: "cross.svg" },
            "borderStyle": "solid",
            "borderColor": "#b5835a",
            "borderRadius": "5"
        },
    }
}
// Initialize the items
defaultCard.items = Array(16);
for (let i = 0; i < defaultCard.items.length; i++) {
  defaultCard.items[i] = structuredClone(defaultItem);
}

// The names of the stylable elements
const stylables = {
  "grid":    c => c.querySelectorAll(".grid"),
  "item":    c => c.querySelectorAll(".bingo-item:not(.crossed)"),
  "crossed": c => c.querySelectorAll(".crossed"),
};


// IDEA: state -> DOM, state -> control, control -> state
// names: toDOM,       toControl,        toState

// All allowed CSS styles in camel casing followed by their functionality
const styleControls = {
  "pixelSize":       [cToDOMStyleSize,  cToControlStyle,      cToStateStyle]    ,
  "backgroundColor": [cToDOMStyle,      cToControlStyle,      cToStateStyle]    ,
  "backgroundImage": [cToDOMStyleFile,  cToControlStyleFile,  cToStateStyleFile],
  "fontSize":        [cToDOMStylePixel, cToControlStyle,      cToStateStyle]    ,
  "fontFamily":      [cToDOMStyleFont,  cToControlStyleFile,  cToStateStyleFile],
  "borderSpacing":   [cToDOMStylePixel, cToControlStyle,      cToStateStyle]    ,
  "borderStyle":     [cToDOMStyle,      cToControlStyle,      cToStateStyle]    ,
  "borderColor":     [cToDOMStyle,      cToControlStyle,      cToStateStyle]    ,
  "padding":         [cToDOMStylePixel, cToControlStyle,      cToStateStyle]    ,
  "borderWidth":     [cToDOMStylePixel, cToControlStyle,      cToStateStyle]    ,
  "borderRadius":    [cToDOMStylePixel, cToControlStyle,      cToStateStyle]    ,
};

async function cToStateStyle(card, name, sName, c) {
  getState(card).style[sName][name] = c.value;
}
function cToControlStyle(card, name, sName, c) {
  c.value = getState(card).style[sName][name];
}
function cToDOMStyle(card, name, sName, e) {
  e.style[name] = getState(card).style[sName][name];
}
function cToDOMStylePixel(card, name, sName, e) {
  e.style[name] = getState(card).style[sName][name] + "px";
}
function cToDOMStyleSize(card, name, sName, e) {
  e.style.width = getState(card).style[sName][name] + "px";
  e.style.height = getState(card).style[sName][name] + "px";
}
// Images
function cToDOMStyleFile(card, name, sName, e) {
  const state = getState(card);
  const sObject = state.style[sName][name];
  if (sObject.isData) {
    // Cache the file if it is not already
    let hash = sObject.hash;
    let fileUrl = cachedFiles.get(hash);
    if (fileUrl == undefined) {
      hash = cyrb53(sObject.url);
      const inMemoryFile = dataURLtoFile(sObject.url, "bigfile");
      fileUrl = URL.createObjectURL(inMemoryFile);
      cachedFiles.set(hash, fileUrl);
    }
    e.style[name] = "url('" + fileUrl + "')";
  }
  else {
    e.style[name] = "url('" + sObject.url + "')";
  }
}
async function cToDOMStyleFont(card, name, sName, e) {
  const state = getState(card);
  const sObject = state.style[sName][name];
  if (sObject.isData) {
    // Cache the file if it is not already
    let hash = sObject.hash;
    let fileUrl = cachedFiles.get(hash);
    const hashLetterString = (hash) => {
      return Array.from(hash.toString()).reduce((acc, char) => {
        acc + char.toString(36);
      }, "");
    };
    if (fileUrl == undefined) {
      hash = cyrb53(sObject.url);
      const inMemoryFile = dataURLtoFile(sObject.url, "bigfile");
      fileUrl = URL.createObjectURL(inMemoryFile);
      cachedFiles.set(hash, fileUrl);
      let custom_font = new FontFace(hashLetterString(hash),
        "url('" + fileUrl  + "')");
      const loaded_font = await custom_font.load();
      document.fonts.add(loaded_font);
    }
    e.style[name] = hashLetterString(hash);
  }
  else {
    // Not actually a url
    e.style[name] = sObject.url;
  }
}
function cToControlStyleFile(card, name, sName, c) {
}
async function cToStateStyleFile(card, name, sName, c) {
  const [file] = c.files;
  const url = await bytesToBase64DataUrl(file);
  getState(card).style[sName][name] = { hash: "", isData: true, url: url };
}

// Generic controls, similar to styling but simpler
const controls = {
  "size":      [ cToDOM, cToControl,      cToStateSize ],
  "tolerance": [ cToDOM, cToControl,      cToState     ],
  "reset":     [ cToDOM, (a, b, c) => {}, cToStateReset],
  "load":      [ cToDOM, (a, b, c) => {}, cToStateLoad ],
  "save":      [ cToDOM, (a, b, c) => {}, cToStateSave ],
};

async function cToState(card, name, c) {
  getState(card)[name] = c.value;
}
function cToDOM(card, name) {
  // hi hi ho ha ha
}
function cToControl(card, name, c) {
  c.value = getState(card)[name];
}
async function cToStateSave(card, name, c) {
  const state = getState(card);
  const jsonString = JSON.stringify(state, null, 4);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'bingo-card.json';
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
async function cToStateLoad(card, name, c) {
  if (c.files.length >= 1) {
    const text = await c.files[0].text();
    const state = JSON.parse(text);
    setState(card, state);
    render(card, state);
  }
}
async function cToStateSize(card, name, c) {
  const state = getState(card);
  const size = c.value;
  state.size = size;
  if (size*size > state.items.length) {
    let additionalItems = Array(size*size - state.items.length);
    for (let i = 0; i < additionalItems.length; i++) {
      additionalItems[i] = structuredClone(defaultItem) ;
    }
    state.items = state.items.concat(additionalItems);
  }
  render(card, state);
}
async function cToStateReset(card, name, c) {
  setState(card, structuredClone(defaultCard));
  render(card, defaultCard);
}


// Public domain hashing function
function cyrb53 (str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for(let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

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

function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[arr.length - 1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while(n--){
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type:mime});
}

// Change the text size to fit in the container
function fitText(state, e) {
  const wantedFontSize = e.classList.contains("crossed") ?
    state.style.crossed.fontSize : state.style.item.fontSize;
  const tolerance = parseFloat(state.tolerance);
  const size = parseInt(state.size);
  const gridSize = parseInt(state.style.grid.pixelSize);
  const borderSpacing = parseInt(state.style.grid.borderSpacing);
  const gridPadding = parseInt(state.style.grid.padding);
  const gridBorderWidth = parseInt(state.style.grid.borderWidth);
  const expected =
    (gridSize - (borderSpacing * (size + 1) + gridPadding*2 + gridBorderWidth*2))
    / size + tolerance;

  let fontSize = Number(e.style.fontSize.substring(0, e.style.fontSize.length - 2.0));

  // Compute the biggest dimension of the rect
  const cOutlier = () => {
    const rect = e.getBoundingClientRect();
    return Math.max(rect.width, rect.height) - tolerance;
  };
  // Maximize as much as until rect grows
  while (fontSize < wantedFontSize) {
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

// Helpers for state
function getState(card) {
  return allCardState.get(card);
}
function setState(card, state) {
  allCardState.set(card, state);
}
function setItemState(card, index, field, value) {
  const state = getState(card);
  state.items[index][field] = value;
}
function getItemState(card, index, field) {
  const state = getState(card);
  return state.items[index][field];
}

// Bingo element to use when generating new bingo cards
const emptyBingoTile = document.createElement("td");
emptyBingoTile.classList.add("bingo-item");
const emptyBingoTileText = document.createElement("div");
emptyBingoTileText.innerText = defaultItem.text;
emptyBingoTileText.classList.add("bingo-text");
emptyBingoTileText.setAttribute("contenteditable", "true");
emptyBingoTile.append(emptyBingoTileText);

// Create a bingo card from state
function render(card) {
  const state = getState(card);
  const grid = card.querySelector(".grid");
  // Add new / remove unwanted elements
  const addChild = (parent) => {
    const newNode = emptyBingoTile.cloneNode(true);
    parent.appendChild(newNode);
    tileSetup(card, grid, newNode);
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
        addChild(grid.children[i]);
      }
    }
    // Add new rows
    for (let i = 0; i < diff; i ++) {
      const newRow = document.createElement("tr");
      grid.appendChild(newRow);
      for (let j = 0; j < newSize; j++) {
        addChild(newRow);
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

  const allBingoItems = card.querySelectorAll(".bingo-item");
  for (let i = 0; i < allBingoItems.length; i++) {
    const bingoItem = allBingoItems[i];
    const bingoText = bingoItem.querySelector(".bingo-text");

    // Load text
    bingoText.innerText = state.items[i].text;

    // Set crossed or not
    if (state.items[i].crossed == "true") {
      bingoItem.classList.add("crossed");
    } else {
      bingoItem.classList.remove("crossed");
    }
  }

  // Reflect state to DOM and controls
  // Styling controls
  for (let sName in defaultCard.style) {
    const category = state.style[sName];
    for (let name in category) {
      const [toDOM, toControl, toState] = styleControls[name];
      // To DOM
      stylables[sName](card).forEach((e) => {
        toDOM(card, name, sName, e);
      });
      // To Control
      card.querySelectorAll("." + name + ".style-" + sName).forEach((c) => {
        toControl(card, name, sName, c);
      });
    }
  }
  // Regular controls
  for (let name in controls) {
    const [toDOM, toControl, toState] = controls[name];
    toDOM(card, name);
    // To Control
    card.querySelectorAll("." + name).forEach((c) => {
      toControl(card, name, c);
    });
  }

  allBingoItems.forEach(bingoItem => {
    // For fitting text, all text needs to be as small as possible
    bingoItem.style.fontSize = "1px";

    // Set width and height to share the available space
    bingoItem.style.width = ((1.0 / state.size) * 100).toFixed(3).concat("%");
    bingoItem.style.height = ((1.0 / state.size) * 100).toFixed(3).concat("%");
  });
  allBingoItems.forEach(bingoItem => {
    // Fit text
    fitText(state, bingoItem);
  });
}

function getItemIndex(card, item) {
  const items = card.querySelectorAll(".bingo-item");
  for (let i = 0; i < items.length; i++) {
    if (items[i] == item) {
      return i;
    }
  }
}

// Set up event listeners for a tile
function tileSetup(card, grid, element) {
  // Crossing
  element.addEventListener("contextmenu", (event) => {
    event.preventDefault();

    const index = getItemIndex(card, element);
    const isCrossed = getItemState(card, index, "crossed") === "true";
    setItemState(card, index, "crossed", (!isCrossed).toString());
    element.classList.toggle("crossed");

    // Update styling on that element only
    const sName = !isCrossed ? "crossed" : "item";
    for (let name in defaultCard.style[sName]) {
      const [toDOM, toControl, toState] = styleControls[name];
      toDOM(card, name, sName, element);
    }
    fitText(getState(card), element);
  });
  // Changing text
  textElement = element.querySelector(".bingo-text");
  textElement.addEventListener("input", (e) => {
    const element = e.currentTarget.parentElement;
    const index = getItemIndex(card, element);
    // Update the state
    setItemState(card, index, "text", e.currentTarget.innerText);
    fitText(getState(card), element);
  });
}

// Set up all functionality for bingo card controls
function setUpBingoCardControls(card) {
  const styleSection = card.querySelector(".style-section-container");
  const styleTemplate = document.querySelector(".style-section-template");
  if (styleSection && styleTemplate) {
    // Instantiate styling controls
    for (let sName in defaultCard.style) {
      const newControls = styleTemplate.content.cloneNode(true);
      newControls.querySelector(".style-section-heading").innerText = sName;
      for (let name in defaultCard.style[sName]) {
        const c = newControls.querySelector("." + name);
        c.classList.add("style-" + sName);
        // Set event listener
        const [toDOM, toControl, toState] = styleControls[name];
        c.addEventListener("change", () => {
          toState(card, name, sName, c).then(() => {
            stylables[sName](card).forEach((e) => toDOM(card, name, sName, e));
          });
        });
      }
      newControls.querySelectorAll(".style:not(.style-" + sName + ")").forEach(c => {
        c.parentElement.remove();
      });
      styleSection.appendChild(newControls);
    }

    // Hook up regular controls
    for (let name in controls) {
      const [toDOM, toControl, toState] = controls[name];
      card.querySelectorAll("." + name).forEach((c) => {
        if (c.nodeName == "BUTTON") {
          c.addEventListener("click", () => {
            toState(card, name, c);
          });
        } else {
          c.addEventListener("change", () => {
            toState(card, name, c).then(() => {
              toDOM(card, name);
            });
          });
        }
      });
    };

    // Empty selection of file selectors
    card.querySelectorAll("input[type=file]").forEach((c) => {
      c.value = "";
    });
  }
}

// Set up controls when app starts
document.querySelectorAll(".card").forEach((card, i) => {
  setUpBingoCardControls(card);

  // Create empty bingo card, use session storage if set
  const sessionName = "card-" + i;
  const initialState = sessionStorage[sessionName] != undefined ?
    structuredClone(JSON.parse(sessionStorage[sessionName])) :
    structuredClone(defaultCard);
  setState(card, initialState);
  render(card, initialState);

  // Continously save card to session storage
  // Not images and fonts
  const backgroundSaving = () => {
    console.log("saving");
    const state = structuredClone(getState(card));
    for (sName in defaultCard.style) {
      for (name in state.style[sName]) {
        if (state.style[sName][name].isData) {
          state.style[sName][name].url = defaultCard.style[sName][name].url;
          delete state.style[sName][name].hash;
          state.style[sName][name].isData = false;
        }
      }
    }
    const jsonString = JSON.stringify(state, null, 4);
    sessionStorage[sessionName] = jsonString;
    setTimeout(backgroundSaving, 3000);
  };
  backgroundSaving();
});


// Page styling
document.querySelectorAll(".collapsible").forEach((e) => {
  e.addEventListener("click", (ev) => {
    const e = ev.currentTarget;
    e.classList.toggle("active");
    const content = e.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
});

