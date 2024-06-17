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
    let element = event.srcElement;
    if (element.classList.contains("bingo-item")) {
        applyCross(element);
    } else {
        applyCross(element.parentElement);
    }
};
let elements = document.getElementsByClassName("bingo-item");
Array.from(elements).forEach((element) => {
  element.addEventListener('contextmenu', crossTile);
});

// Saving / Loading bingo board

// Get text from bingo card
// Ordering works, according to spec
function getBingoCardState (bingoCard) {
  let bingoEntries = document.getElementsByClassName("bingo-text");
  const entries = [];
  Array.from(bingoEntries).forEach((bingoEntry) => {
    // Only those that are under bingoCard
    if (bingoEntry.parentElement.parentElement.parentElement == bingoCard) {
      entries.push(bingoEntry.innerHTML);
    }
    console.log(bingoEntry.innerHTML);
  });
  return entries;
}

let saveButtons = document.getElementsByClassName("save");
Array.from(saveButtons).forEach((button) => {
  button.onclick = () => {
    console.log(getBingoCardState(button.parentElement));
  }
});

