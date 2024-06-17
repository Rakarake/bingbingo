console.log("amongus 🤨")

// Crossing tiles
var applyCross = function(element) {
    if (!element.classList.contains("crossed")) {
        element.classList.add("crossed");
    } else {
        element.classList.remove("crossed");
    }
}
var crossTile = function(event) {
    // No context menu when right clicking
    event.preventDefault();
    let element = event.srcElement;
    if (element.classList.contains("bingo-item")) {
        applyCross(element);
    } else {
        applyCross(element.parentElement);
    }
};
var elements = document.getElementsByClassName("bingo-item");
for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener('contextmenu', crossTile, false);
}

