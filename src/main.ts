import { errorModal, restaurantRow, weeklyMenuHtml, dailyMenuTable } from "./components";
import { fetchData } from "./functions";
import { Courses, WeeklyMenu } from "./types/Menu";
import { Restaurant } from "./types/Restaurant";
import { apiUrl, positionOptions } from "./variables";

//Checkbox teeman vaihtoon
const checkbox = document.getElementById("checkbox") as HTMLInputElement | null;
const html = document.documentElement;

const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
  html.setAttribute("data-theme", savedTheme);
  if (checkbox) checkbox.checked = savedTheme === "dark";
} else {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const defaultTheme = prefersDark ? "dark" : "light";
  html.setAttribute("data-theme", defaultTheme);
  if (checkbox) checkbox.checked = prefersDark;
}

if (checkbox) {
  checkbox.addEventListener("change", () => {
    const newTheme = checkbox.checked ? "dark" : "light";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });
}

//Suodata tuloksia pienellä näytöllä
const filterToggleBtn = document.getElementById("toggleFilters") as HTMLElement;
const filters = document.getElementById("filters") as HTMLElement;

filterToggleBtn.addEventListener("click", () => {
  filterToggleBtn.classList.toggle("open");
  filters.classList.toggle("open");
});

//Service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/~suvimyn/2025/jakso1/projekti/build/sw.js")
    .then((reg) => console.log("Service worker registered:", reg))
    .catch((err) => console.error("Registration failed:", err));
} else {
  console.warn("Service workers are not supported in this browser.");
}

//Modaali
const modal = document.querySelector("dialog") as HTMLDialogElement;
if (!modal) {
  throw new Error("Modal not found");
}
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.close();
  }
});

//Etäisyyslaskuri
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const R = 6371e3;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance;
};


//Viikon ruokalista
const fetchWeeklyMenu = async (restaurantId: string): Promise<WeeklyMenu> => {
  return await fetchData<WeeklyMenu>(
    `${apiUrl}/restaurants/weekly/${restaurantId}/fi`,
  );
};

//Ravintolataulukko ja ruokalistat päivälle sekä viikolle
const createTable = (restaurants: Restaurant[]) => {
  const table = document.querySelector("table");
  if (!table) {
    throw new Error("Oh no!");
  }
  table.innerHTML = "";
  restaurants.forEach((restaurant, index) => {
    const tr: HTMLTableRowElement = restaurantRow(restaurant);
    if (index === 0) {
      tr.classList.add("nearest-restaurant");
    }
    table.appendChild(tr);
    tr.addEventListener("click", async () => {
      try {
        const allHighs = document.querySelectorAll(".highlight");
        allHighs.forEach((high) => high.classList.remove("highlight"));
        tr.classList.add("highlight");
        modal.innerHTML = "";

        const [dailyMenu, weeklyMenu] = await Promise.all([
          fetchData<Courses>(
            `${apiUrl}/restaurants/daily/${restaurant._id}/fi`,
          ),
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
        } else if (dailyMenu.courses?.length) {
          html = `
            <h3>${restaurant.name}</h3>
            <p>${restaurant.company}</p>
            <p>${restaurant.address} ${restaurant.postalCode} ${restaurant.city}</p>
            <p>${restaurant.phone}</p>
            <div class="tab-content" id="daily">
              ${dailyMenuTable(dailyMenu)}
            </div>
          `;
        } else if (weeklyMenu.days?.length) {
          html = `
            <h3>${restaurant.name}</h3>
            <p>${restaurant.company}</p>
            <p>${restaurant.address} ${restaurant.postalCode} ${restaurant.city}</p>
            <p>${restaurant.phone}</p>
            ${weeklyMenuHtml(weeklyMenu)}
          `;
        } else {
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
              } else {
                c.classList.add("hidden");
              }
            });
          });
        });

        modal.showModal();
      } catch (error) {
        modal.innerHTML = `
          <h3 class="modal-heading">Virhe</h3>
          <p>${(error as Error).message}</p>
        `;
        modal.showModal();
      }
    });
  });
};

//Jos paikannus ei onnistu
const error = async (err: GeolocationPositionError) => {
  console.warn(`ERROR(${err.code}): ${err.message}`);
  try {
    const restaurants = await fetchData<Restaurant[]>(apiUrl + "/restaurants");
    restaurants.sort((a, b) => {
      const cityCompare = (a.city || "").localeCompare(b.city || "");
      if (cityCompare !== 0) return cityCompare;
      return a.name.localeCompare(b.name);
    });
    createTable(restaurants);
  } catch (fetchError) {
    modal.innerHTML = `
      <h3 class="modal-heading">Virhe</h3>
      <p>${(fetchError as Error).message}</p>
    `;
    modal.showModal();
  }
};

//Paikannus onnistuu
const success = async (pos: GeolocationPosition) => {
  try {
    const crd = pos.coords;
    const restaurants = await fetchData<Restaurant[]>(apiUrl + "/restaurants");

    // Tallennetaan alkuperäinen etäisyysjärjestetty lista
    const distanceSortedRestaurants = [...restaurants];
    distanceSortedRestaurants.sort((a, b) => {
      const userLat = crd.latitude;
      const userLon = crd.longitude;

      // Ravintolan koordinaatit, oletetaan että location.coordinates = [longitude, latitude]
      const latA = a.location.coordinates[1];
      const lonA = a.location.coordinates[0];
      const latB = b.location.coordinates[1];
      const lonB = b.location.coordinates[0];

      const distanceA = calculateDistance(userLat, userLon, latA, lonA) / 1000;
      const distanceB = calculateDistance(userLat, userLon, latB, lonB) / 1000;

      return distanceA - distanceB;
    });

    // Aluksi näytetään etäisyysjärjestyksessä
    createTable(distanceSortedRestaurants);

    //Filtterit
    const sodexoBtn = document.querySelector("#sodexo") as HTMLButtonElement;
    const compassBtn = document.querySelector("#compass") as HTMLButtonElement;
    const resetBtn = document.querySelector("#reset") as HTMLButtonElement;
    const citySelect = document.getElementById("cityFilter") as HTMLSelectElement;
    const sortAlphaBtn = document.querySelector("#sortAlphabetically") as HTMLButtonElement;
    const nameInput = document.querySelector("#nameFilter") as HTMLInputElement;
    const distanceSelect = document.querySelector("#distanceFilter") as HTMLSelectElement;

    if (!sodexoBtn || !compassBtn || !resetBtn || !citySelect || !sortAlphaBtn || !nameInput || !distanceSelect) {
      return;
    }

    let selectedCompany: string = "";
    let selectedCity: string = "";
    let isSortedAlphabetically = false;
    let nameQuery: string = "";
    let distanceLimit: number | null = null;

    function populateCityFilter() {
      if (!citySelect) return;

      const cities = [
        ...new Set(
          distanceSortedRestaurants.map((r) => r.city).filter((city) => city),
        ),
      ].sort();

      citySelect.innerHTML = "";

      const allOption = document.createElement("option");
      allOption.value = "";
      allOption.textContent = "Kaikki kaupungit";
      citySelect.appendChild(allOption);

      cities.forEach((city) => {
        const option = document.createElement("option");
        option.value = city!;
        option.textContent = city!;
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

    citySelect.addEventListener("change", () => {
      selectedCity = citySelect.value;
      filterRestaurants();
    });

    sortAlphaBtn.addEventListener("click", () => {
      isSortedAlphabetically = !isSortedAlphabetically;
      filterRestaurants();
    });

    nameInput.addEventListener("input", () => {
      nameQuery = nameInput.value.trim().toLowerCase();
      filterRestaurants();
    });

    distanceSelect.addEventListener("change", () => {
      const value = distanceSelect.value;
      distanceLimit = value ? parseInt(value) : null;
      filterRestaurants();
    });

    resetBtn.addEventListener("click", () => {
      selectedCompany = "";
      selectedCity = "";
      citySelect.value = "";
      isSortedAlphabetically = false;
      nameQuery = "";
      nameInput.value = "";
      distanceLimit = null;
      distanceSelect.value = "";
      filterRestaurants();
    });

    function filterRestaurants() {
      let filtered = distanceSortedRestaurants.filter((restaurant) => {
        const matchCompany = selectedCompany === "" || restaurant.company === selectedCompany;
        const matchCity = selectedCity === "" || restaurant.city === selectedCity;
        const matchName = nameQuery === "" || restaurant.name.toLowerCase().includes(nameQuery.toLowerCase());

        // Lasketaan etäisyys ja muutetaan se kilometreiksi
        const distanceKm = calculateDistance(
          crd.latitude,
          crd.longitude,
          restaurant.location.coordinates[1],
          restaurant.location.coordinates[0],
        ) / 1000; // Etäisyys kilometreissä

        // Varmistetaan, että distanceLimit on oikeassa muodossa (muutetaan numeeriseksi)
        const distanceLimitNum = distanceLimit ? Number(distanceLimit) : Infinity;

        // Tarkistetaan, täyttääkö ravintola etäisyysrajan
        const matchDistance = distanceKm <= distanceLimitNum + 0.01;

        // Lisätyt konsolilokit:
        console.log(`Ravintola: ${restaurant.name}`);
        console.log(`Etäisyys: ${distanceKm.toFixed(2)} km`);
        console.log(`Valittu etäisyysraja: ${distanceLimitNum} km`);
        console.log(`Match distance: ${matchDistance}`);

        return matchCompany && matchCity && matchName && matchDistance;
      });

      if (isSortedAlphabetically) {
        filtered = filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
      }
      createTable(filtered);
    }
  } catch (error) {
    modal.innerHTML = `
      <h3 class="modal-heading">Virhe</h3>
      <p>${(error as Error).message}</p>
    `;
    modal.showModal();
  }
};

// Pyydä sijainti
navigator.geolocation.getCurrentPosition(success, error, positionOptions);
