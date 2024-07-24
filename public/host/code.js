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

const cardSection = document.querySelector(".card-section");
const passwordElement = document.querySelector(".password");
const passwordConfirmElement = document.querySelector(".password-confirm");

// Continously fetch the room
async function backgroundFetching() {
  // Cursed, but it works
  // TODO: set up proper api paths
  const url = window.location.href.substring(0, (window.location.href.length-1) - "host/".length)
    + "/api/room/" + passwordElement.value + "/cards";
  //const url = "http://127.0.0.1:3000/api/room/gabagool/cards";
  console.log("fetching room from", url);
  if (passwordConfirmElement.checked && passwordElement.value != "") {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Response status: ${response.status}, URL: ${url}`);
      setTimeout(backgroundFetching, 3000);
    }
    let result = "";
    try {
      result = await response.json();
    } catch (error) {
      //TODO: display that the room is empty
      setTimeout(backgroundFetching, 3000);
      return;
    }
    // Render all cards, create elements if they do not exist
    Object.keys(result.cards).forEach((name) => {
      console.log("trying name: ", name, "card:", result.cards[name]);
      // TODO: handle badly formated JSON
      try {
        const state = JSON.parse(result.cards[name]);
        console.log("parsed!", state);
        let card = Array.from(cardSection.querySelectorAll(".card")).find((card) => card.dataset.name == name);
        if (card == undefined) {
          // Create card element
          card = document.createElement("div");
          card.dataset.name = name;
          const grid = document.createElement("table");
          card.classList.add("card");
          grid.classList.add("grid");
          card.appendChild(grid);
          cardSection.appendChild(card);
        }
        setState(card, state);
        render(card);
        console.log("rendered!");
      } catch (error) {
        console.error(error);
      }
    });
    setTimeout(backgroundFetching, 3000);
  } else {
    setTimeout(backgroundFetching, 3000);
  }
}
backgroundFetching();

