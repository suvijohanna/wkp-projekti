import { Courses, WeeklyMenu } from "./types/Menu";
import { Restaurant } from "./types/Restaurant";

const restaurantRow = (restaurant: Restaurant) => {
  const { name, address, city, company } = restaurant;
  const tr = document.createElement("tr");
  const nameCell = document.createElement("td");
  nameCell.innerText = name;
  nameCell.setAttribute("data-label", "Nimi");
  const addressCell = document.createElement("td");
  addressCell.innerText = address;
  addressCell.setAttribute("data-label", "Osoite");
  const cityCell = document.createElement("td");
  cityCell.innerText = city;
  cityCell.setAttribute("data-label", "Kaupunki");
  const companyCell = document.createElement("td");
  companyCell.innerText = company;
  companyCell.setAttribute("data-label", "Yritys");
  tr.appendChild(nameCell);
  tr.appendChild(addressCell);
  tr.appendChild(cityCell);
  tr.appendChild(companyCell);
  return tr;
};

const weeklyMenuHtml = (weeklyMenu: WeeklyMenu): string => {
  let html = `<h3 class="modal-heading">Viikon ruokalista</h3>`;

  weeklyMenu.days.forEach((day) => {
    html += `<h4 class="modal-subheading">${day.date}</h4>`;
    html += `<table class="weekly-menu-table responsive-table">
      <thead>
        <tr>
          <th>Ruoka</th>
          <th>Ruokavaliot</th>
          <th>Hinta</th>
        </tr>
      </thead>`;

    day.courses.forEach((course) => {
      const { name, diets, price } = course;
      const formattedDiets = typeof diets === "string" && diets.trim() !== ""
        ? diets.replace(/,(\S)/g, ", $1")
        : "Ei saatavilla";
      html += `
        <tr>
          <td data-label="Ruoka">${name}</td>
          <td data-label="Ruokavaliot">${formattedDiets}</td>
          <td data-label="Hinta">${price ?? "Ei saatavilla"}</td>
        </tr>
      `;
    });
  html += `</table>`;
});


  return html;
};

const dailyMenuTable = (menu: Courses): string => {
  let html = `<table class="menu-table responsive-table">
    <thead>
      <tr>
        <th>Ruoka</th>
        <th>Ruokavaliot</th>
        <th>Hinta</th>
      </tr>
    </thead>
  `;

  menu.courses.forEach((course) => {
    const { name, diets, price } = course;
    const formattedDiets = typeof diets === "string" && diets.trim() !== ""
      ? diets.replace(/,(\S)/g, ", $1")
      : "Ei saatavilla";
    html += `
      <tr>
        <td data-label="Ruoka">${name}</td>
        <td data-label="Ruokavaliot">${formattedDiets}</td>
        <td data-label="Hinta">${price ?? "Ei saatavilla"}</td>
      </tr>
    `;
  });

  html += "</table>";
  return html;
};


const errorModal = (message: string, restaurant?: Restaurant) => {
  let html = `
    <h3 class="modal-heading">Virhe</h3>
    <p>${message}</p>
  `;

  if (restaurant) {
    html = `
      <h3>${restaurant.name}</h3>
      <p>${restaurant.company}</p>
      <p>${restaurant.address} ${restaurant.postalCode} ${restaurant.city}</p>
      <p>${restaurant.phone}</p>
      <hr />
      <p>${message}</p>
    `;
  }
  return html;
};

export { restaurantRow, errorModal, weeklyMenuHtml, dailyMenuTable };
