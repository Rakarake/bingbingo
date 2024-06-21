console.log("amongus 🤨")

// Crossing tiles
function applyCross(element) {
    if (!element.classList.contains("crossed")) {
        element.classList.add("crossed");
    } else {
        element.classList.remove("crossed");
    }
}
function crossTile(event) {
    // No context menu when right clicking
    event.preventDefault();
    // Recursively go upwards in the tree and find the outer tile element
    let tryParent = (element) => {
      if (element.classList.contains("bingo-item")) {
        applyCross(element);
      } else {
        tryParent(element.parentElement);
      }
    };
    tryParent(event.srcElement);
};
document.querySelectorAll(".bingo-item").forEach((element) => {
  element.addEventListener('contextmenu', crossTile);
});


// Tile initial setup, add relevant event listeners to bingo tile
function tileInitialSetup(element) {
  // Setup crossing tiles
  element.addEventListener("contextmenu", crossTile);
  // Setup updating the save-link
  element.childNodes.forEach((child) => {
    if (child.classList && child.classList.contains("bingo-text")) {
      child.addEventListener("input", () => {
        updateSaveBingoCardLink(child.parentElement.parentElement.parentElement);
      });
    }
  });
}
// Apply initial setup to exsisting tiles
document.querySelectorAll(".bingo-item").forEach((element) => {
  tileInitialSetup(element);
});

// Saving / Loading
// Get text from bingo card
// Ordering works, according to spec
function getBingoCardState (bingoCard) {
  const entries = [];
  document.querySelectorAll(".bingo-text").forEach((bingoEntry) => {
    // Only those that are under bingoCard
    if (bingoEntry.parentElement.parentElement.parentElement == bingoCard) {
      entries.push(bingoEntry.innerText);
    }
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
// Update link when application starts
document.querySelectorAll(".bingo-card-container").forEach((element) => {
  updateSaveBingoCardLink(element);
});


// Add loading functionality
document.querySelectorAll(".load").forEach((element) => {
  element.addEventListener("change", () => {
    if (element.files.length >= 1) {
      element.files[0].text().then((v) => {
        const state = JSON.parse(v);
        const bingoCard = element.parentElement;
        removeAllChildren(bingoCard);
        createBingoCard(bingoCard, state.size, state.card);
        updateSaveBingoCardLink(bingoCard);
      });
    }
  });
});

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
    tileInitialSetup(newNode);
  }
  updateSaveBingoCardLink(bingoCard.parentElement);
}
// Helper
function removeAllChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

// Remake bingo card when size is changed
document.querySelectorAll(".size").forEach((element) => {
  element.addEventListener("change", () => {
    element.parentElement.childNodes.forEach((child) => {
      if (child.classList && child.classList.contains("bingo-card")) {
        removeAllChildren(child);
        createBingoCard(child, element.value);
      }
    });
  });
});

