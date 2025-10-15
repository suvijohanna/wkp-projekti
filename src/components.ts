import { Courses, WeeklyMenu } from "./types/Menu";
import { Restaurant } from "./types/Restaurant";

const restaurantRow = (restaurant: Restaurant) => {
  const { name, address, city, company } = restaurant;
  const tr = document.createElement("tr");
  const nameCell = document.createElement("td");
  nameCell.innerText = name;
  const addressCell = document.createElement("td");
  addressCell.innerText = address;
  const cityCell = document.createElement("td");
  cityCell.innerText = city;
  const companyCell = document.createElement("td");
  companyCell.innerText = company;
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
    html += `<table class="weekly-menu-table">
      <tr>
        <th>Ruoka</th>
        <th>Ruokavaliot</th>
        <th>Hinta</th>
      </tr>`;

    day.courses.forEach((course) => {
      const { name, diets, price } = course;
      const formattedDiets = typeof diets === "string" ? diets.replace(/,(\S)/g, ", $1") : "-";
      html += `
        <tr>
          <td>${name}</td>
          <td>${formattedDiets}</td>
          <td>${price ?? "-"}</td>
        </tr>
      `;
    });

    html += `</table>`;
  });

  return html;
};

const dailyMenuTable = (menu: Courses): string => {
  let html = `<table class="menu-table">
    <tr>
      <th>Ruoka</th>
      <th>Ruokavaliot</th>
      <th>Hinta</th>
    </tr>
  `;

  menu.courses.forEach((course) => {
    const { name, diets, price } = course;
    const formattedDiets = typeof diets === "string" ? diets.replace(/,(\S)/g, ", $1") : "-";
    html += `
      <tr>
        <td>${name}</td>
        <td>${formattedDiets}</td>
        <td>${price ?? " - "}</td>
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
