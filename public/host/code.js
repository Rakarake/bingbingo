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

console.log("morbius 🤨");

const cardSection = document.querySelector(".card-section");
const passwordElement = document.querySelector(".password");
const passwordConfirmElement = document.querySelector(".password-confirm");

// Continously fetch the room
const backgroundFetching = () => {
  const url = window.location.href + "cards";
  if (passwordConfirmElement.checked && passwordElement.value != "") {
    const body = {
      password: passwordElement.value,
    };
    const response = fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    response.json().then((result) => {
      // Render all cards, create elements if they do not exist
      Object.keys(result.cards).forEach((name) => {
        const state = result.cards[name];
        let card = cardSection.querySelectorAll(".card").find((card) => card.dataset.name == name);
        if (card == undefined) {
          // Create card element
          card = document.createElement("div");
          const grid = document.createElement("table");
          card.classList.add("card");
          grid.classList.add("grid");
          card.appendChild(grid);
          cardSection.appendChild(card);
        }
        renderCard(card, state);
      });
      setTimeout(backgroundFetching, 3000);
    });
  } else {
    setTimeout(backgroundFetching, 3000);
  }
}
backgroundFetching();

