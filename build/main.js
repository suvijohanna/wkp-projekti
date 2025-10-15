'use strict';

const restaurantRow = (restaurant) => {
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
const weeklyMenuHtml = (weeklyMenu) => {
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
const dailyMenuTable = (menu) => {
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

const fetchData = async (url, options = {}) => {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`Error ${response.status} occurred`);
    }
    const json = response.json();
    return json;
};

const apiUrl = 'https://media1.edu.metropolia.fi/restaurant/api/v1';
const positionOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
};

//Checkbox teeman vaihtoon
const checkbox = document.getElementById("checkbox");
const html = document.documentElement;
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
    html.setAttribute("data-theme", savedTheme);
    if (checkbox)
        checkbox.checked = savedTheme === "dark";
}
else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const defaultTheme = prefersDark ? "dark" : "light";
    html.setAttribute("data-theme", defaultTheme);
    if (checkbox)
        checkbox.checked = prefersDark;
}
if (checkbox) {
    checkbox.addEventListener("change", () => {
        const newTheme = checkbox.checked ? "dark" : "light";
        html.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    });
}
//Service worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("/build/sw.js")
        .then((reg) => console.log("Service worker registered:", reg))
        .catch((err) => console.error("Registration failed:", err));
}
else {
    console.warn("Service workers are not supported in this browser.");
}
//Modaali
const modal = document.querySelector("dialog");
if (!modal) {
    throw new Error("Modal not found");
}
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.close();
    }
});
//Etäisyyslaskuri
const calculateDistance = (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
//Viikon ruokalista
const fetchWeeklyMenu = async (restaurantId) => {
    return await fetchData(`${apiUrl}/restaurants/weekly/${restaurantId}/fi`);
};
//Ravintolataulukko
const createTable = (restaurants) => {
    const table = document.querySelector("table");
    if (!table) {
        throw new Error("Oh no!");
    }
    table.innerHTML = "";
    restaurants.forEach((restaurant) => {
        const tr = restaurantRow(restaurant);
        table.appendChild(tr);
        tr.addEventListener("click", async () => {
            try {
                const allHighs = document.querySelectorAll(".highlight");
                allHighs.forEach((high) => high.classList.remove("highlight"));
                tr.classList.add("highlight");
                modal.innerHTML = "";
                const [dailyMenu, weeklyMenu] = await Promise.all([
                    fetchData(`${apiUrl}/restaurants/daily/${restaurant._id}/fi`),
                    fetchWeeklyMenu(restaurant._id),
                ]);
                let html = "";
                if (dailyMenu.courses?.length && weeklyMenu.days?.length) {
                    html = `
            <h3>${restaurant.name}</h3>
            <p>${restaurant.company}</p>
            <p>${restaurant.address} ${restaurant.postalCode} ${restaurant.city}</p>
            <p>${restaurant.phone}</p>
            <div class="tabs">
              <button class="tab-button active" data-tab="daily">Päivän menu</button>
              <button class="tab-button" data-tab="weekly">Viikon menu</button>
            </div>
            <div class="tab-content" id="daily">
              ${dailyMenuTable(dailyMenu)}
            </div>
            <div class="tab-content hidden" id="weekly">
              ${weeklyMenuHtml(weeklyMenu)}
            </div>
          `;
                }
                else if (dailyMenu.courses?.length) {
                    html = `
            <h3>${restaurant.name}</h3>
            <p>${restaurant.company}</p>
            <p>${restaurant.address} ${restaurant.postalCode} ${restaurant.city}</p>
            <p>${restaurant.phone}</p>
            <div class="tab-content" id="daily">
              ${dailyMenuTable(dailyMenu)}
            </div>
          `;
                }
                else if (weeklyMenu.days?.length) {
                    html = `
            <h3>${restaurant.name}</h3>
            <p>${restaurant.company}</p>
            <p>${restaurant.address} ${restaurant.postalCode} ${restaurant.city}</p>
            <p>${restaurant.phone}</p>
            ${weeklyMenuHtml(weeklyMenu)}
          `;
                }
                else {
                    html = `
            <h3>${restaurant.name}</h3>
            <p>${restaurant.company}</p>
            <p>${restaurant.address} ${restaurant.postalCode} ${restaurant.city}</p>
            <p>${restaurant.phone}</p>
            <p style="font-weight: bold;">Ruokalistat eivät ole saatavilla</p>
          `;
                }
                modal.insertAdjacentHTML("beforeend", html);
                const tabButtons = modal.querySelectorAll(".tab-button");
                const tabContents = modal.querySelectorAll(".tab-content");
                tabButtons.forEach((btn) => {
                    btn.addEventListener("click", () => {
                        const tab = btn.getAttribute("data-tab");
                        tabButtons.forEach((b) => b.classList.remove("active"));
                        btn.classList.add("active");
                        tabContents.forEach((c) => {
                            if (c.id === tab) {
                                c.classList.remove("hidden");
                            }
                            else {
                                c.classList.add("hidden");
                            }
                        });
                    });
                });
                modal.showModal();
            }
            catch (error) {
                modal.innerHTML = `
          <h3 class="modal-heading">Virhe</h3>
          <p>${error.message}</p>
        `;
                modal.showModal();
            }
        });
    });
};
//Jos paikannus ei onnistu
const error = async (err) => {
    console.warn(`ERROR(${err.code}): ${err.message}`);
    try {
        const restaurants = await fetchData(apiUrl + "/restaurants");
        restaurants.sort((a, b) => {
            const cityCompare = (a.city || "").localeCompare(b.city || "");
            if (cityCompare !== 0)
                return cityCompare;
            return a.name.localeCompare(b.name);
        });
        createTable(restaurants);
    }
    catch (fetchError) {
        modal.innerHTML = `
      <h3 class="modal-heading">Virhe</h3>
      <p>${fetchError.message}</p>
    `;
        modal.showModal();
    }
};
//Paikannus onnistuu
const success = async (pos) => {
    try {
        const crd = pos.coords;
        const restaurants = await fetchData(apiUrl + "/restaurants");
        // Tallennetaan alkuperäinen etäisyysjärjestetty lista
        const distanceSortedRestaurants = [...restaurants];
        distanceSortedRestaurants.sort((a, b) => {
            const x1 = crd.latitude;
            const y1 = crd.longitude;
            const x2a = a.location.coordinates[1];
            const y2a = a.location.coordinates[0];
            const distanceA = calculateDistance(x1, y1, x2a, y2a);
            const x2b = b.location.coordinates[1];
            const y2b = b.location.coordinates[0];
            const distanceB = calculateDistance(x1, y1, x2b, y2b);
            return distanceA - distanceB;
        });
        // Aluksi näytetään etäisyysjärjestyksessä
        createTable(distanceSortedRestaurants);
        const sodexoBtn = document.querySelector("#sodexo");
        const compassBtn = document.querySelector("#compass");
        const resetBtn = document.querySelector("#reset");
        const citySelect = document.getElementById("cityFilter");
        const sortAlphaBtn = document.querySelector("#sortAlphabetically");
        if (!sodexoBtn ||
            !compassBtn ||
            !resetBtn ||
            !citySelect ||
            !sortAlphaBtn) {
            return;
        }
        let selectedCompany = "";
        let selectedCity = "";
        let isSortedAlphabetically = false;
        function populateCityFilter() {
            if (!citySelect)
                return;
            const cities = [
                ...new Set(distanceSortedRestaurants.map((r) => r.city).filter((city) => city)),
            ].sort();
            citySelect.innerHTML = "";
            const allOption = document.createElement("option");
            allOption.value = "";
            allOption.textContent = "Kaikki kaupungit";
            citySelect.appendChild(allOption);
            cities.forEach((city) => {
                const option = document.createElement("option");
                option.value = city;
                option.textContent = city;
                citySelect.appendChild(option);
            });
        }
        populateCityFilter();
        sodexoBtn.addEventListener("click", () => {
            selectedCompany = "Sodexo";
            filterRestaurants();
        });
        compassBtn.addEventListener("click", () => {
            selectedCompany = "Compass Group";
            filterRestaurants();
        });
        resetBtn.addEventListener("click", () => {
            selectedCompany = "";
            selectedCity = "";
            citySelect.value = "";
            isSortedAlphabetically = false;
            filterRestaurants();
        });
        citySelect.addEventListener("change", () => {
            selectedCity = citySelect.value;
            filterRestaurants();
        });
        sortAlphaBtn.addEventListener("click", () => {
            isSortedAlphabetically = !isSortedAlphabetically;
            filterRestaurants();
        });
        function filterRestaurants() {
            let filtered = distanceSortedRestaurants.filter((restaurant) => {
                const matchCompany = selectedCompany === "" || restaurant.company === selectedCompany;
                const matchCity = selectedCity === "" || restaurant.city === selectedCity;
                return matchCompany && matchCity;
            });
            if (isSortedAlphabetically) {
                filtered = filtered
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name));
            }
            createTable(filtered);
        }
    }
    catch (error) {
        modal.innerHTML = `
      <h3 class="modal-heading">Virhe</h3>
      <p>${error.message}</p>
    `;
        modal.showModal();
    }
};
// Pyydä sijainti
navigator.geolocation.getCurrentPosition(success, error, positionOptions);
