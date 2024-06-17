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
    let element = event.srcElement;
    if (element.classList.contains("bingo-item")) {
        event.preventDefault();
        applyCross(element);
    } else {
        console.log("GLLOOOOOBYYYEEEE");
        console.log(element);
        applyCross(element.parentElement);
    }
};
var elements = document.getElementsByClassName("bingo-item");
console.log(elements.length);
for (var i = 0; i < elements.length; i++) {
    console.log("gooa");
    elements[i].addEventListener('contextmenu', crossTile, false);
}

