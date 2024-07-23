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

// Set up controls when app starts
document.querySelectorAll(".card").forEach((card, i) => {
  setUpControls(card);

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

