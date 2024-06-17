console.log("amongus 🤨")

// Crossing tiles
let applyCross = function(element) {
    if (!element.classList.contains("crossed")) {
        element.classList.add("crossed");
    } else {
        element.classList.remove("crossed");
    }
}
let crossTile = function(event) {
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
for (let i = 0; i < elements.length; i++) {
    elements[i].addEventListener('contextmenu', crossTile, false);
}

// Saving / Loading bingo board

// Get text from bingo card


