console.log("amongus 🤨")

function dragstartHandler(ev) {
  // Add the target element's id to the data transfer object
  ev.dataTransfer.setData("text/plain", ev.target.id);
  ev.dataTransfer.dropEffect = "move";
}

window.addEventListener("DOMContentLoaded", () => {
  // Get the element by id
  const element = document.getElementById("p1");
  // Add the ondragstart event listener
  element.addEventListener("dragstart", dragstartHandler);
});



