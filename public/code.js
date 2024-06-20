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

function setBingoCardState (bingoCardContainer, state) {
  let relevantTextElements = [];
  document.querySelectorAll(".bingo-text").forEach((element) => {
    if (element.parentElement.parentElement.parentElement == bingoCardContainer) {
      relevantTextElements.push(element);
    }
  });
  for (let i = 0; i < Math.min(relevantTextElements.length, state.length); i++) {
    relevantTextElements[i].innerText = state[i];
  }
}

function updateSaveBingoCardLink (bingoCardContainer) {
  document.querySelectorAll(".save").forEach((element) => {
    if (element.parentElement == bingoCardContainer) {
      const json = { card: getBingoCardState(element.parentElement) };
      const jsonString = JSON.stringify(json);
      const blob = new Blob([jsonString], { type: 'application/json' });
      element.href = URL.createObjectURL(blob);
      element.download = 'bingo-card.json';  // Filename of download
    }
  });
}

// Observe relevant elements for changes, and update links when changes happen
document.querySelectorAll(".bingo-text").forEach((element) => {
  element.addEventListener("input", () => {
      updateSaveBingoCardLink(element.parentElement.parentElement.parentElement);
  });
  updateSaveBingoCardLink(element.parentElement.parentElement.parentElement);
});

// Add loading functionality
document.querySelectorAll(".load").forEach((element) => {
  element.addEventListener("change", () => {
    if (element.files.length >= 1) {
      element.files[0].text().then((v) => {
        setBingoCardState(element.parentElement, JSON.parse(v).card);
        updateSaveBingoCardLink(element.parentElement);
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
function createBingoCard (bingoCard, size) {
  // Remove old elements
  removeAllChildren(bingoCard);
  // Update CSS
  console.log(size);
  bingoCard.style.gridTemplateColumns = "repeat(".concat(size, ", minmax(0, 1fr))");
  // Add new elements
  for (let i = 0; i < (size*size); i++) {
    const newNode = emptyBingoTile.cloneNode(true);
    bingoCard.appendChild(newNode);
    newNode.addEventListener('contextmenu', crossTile);
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
    //removeAllChildren();
  });
});

