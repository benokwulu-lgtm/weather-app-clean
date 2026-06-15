// ================================================
// API CONFIGURATION
// This is where your OpenWeatherMap key goes.
// We also define the base URL we'll build our
// request from. units=metric gives us Celsius.
// ================================================

const API_KEY = "API_KEY"; // 🔑 Replace with your actual key
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";


// ================================================
// DOM ELEMENTS
// We grab all the HTML elements we need to read
// or update, and store them in variables up here.
// This is cleaner than calling getElementById()
// scattered all over the place.
// ================================================

const cityInput     = document.getElementById("city-input");
const searchBtn     = document.getElementById("search-btn");

const statusSection  = document.getElementById("status-section");
const statusMessage  = document.getElementById("status-message");

const weatherSection = document.getElementById("weather-section");
const cityName       = document.getElementById("city-name");
const countryCode    = document.getElementById("country-code");
const weatherIcon    = document.getElementById("weather-icon");
const temperature    = document.getElementById("temperature");
const weatherDesc    = document.getElementById("weather-description");
const feelsLike      = document.getElementById("feels-like");
const humidity       = document.getElementById("humidity");
const windSpeed      = document.getElementById("wind-speed");
const visibility     = document.getElementById("visibility");


// ================================================
// EVENT LISTENERS
// Two ways to trigger a search:
//   1. Clicking the Search button
//   2. Pressing Enter while typing in the input
// Both call the same handleSearch() function.
// ================================================

searchBtn.addEventListener("click", handleSearch);

cityInput.addEventListener("keydown", function (event) {
  // event.key tells us which key was pressed
  if (event.key === "Enter") {
    handleSearch();
  }
});


// ================================================
// HANDLE SEARCH
// This is the entry point. It reads the input,
// does basic validation, then kicks off the
// API call.
// ================================================

function handleSearch() {
  // .trim() removes any accidental leading/trailing spaces
  const city = cityInput.value.trim();

  // Don't bother calling the API if the input is empty
  if (!city) {
    showStatus("Please enter a city name.", "error");
    return; // Stop the function here
  }

  // Input looks good — fetch the weather
  fetchWeather(city);
}


// ================================================
// FETCH WEATHER
// This is where we actually call the API.
// We use async/await — a clean way to handle
// operations that take time (like network requests).
//
// async  → marks this function as asynchronous
// await  → pauses here until the promise resolves
// try/catch → if anything goes wrong, catch handles it
// ================================================

async function fetchWeather(city) {

  // Show a loading message while we wait for the API
  showStatus("Fetching weather...", "loading");

  // Hide the old weather card while we load new data
  weatherSection.hidden = true;

  try {
    // Build the full API URL with our city, key, and units
    // Example result: https://api.openweathermap.org/data/2.5/weather?q=Lagos&appid=abc123&units=metric
    const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    // fetch() sends an HTTP GET request to that URL
    // await pauses until the server responds
    const response = await fetch(url);

    // The API returns JSON data, but first we need to
    // parse the response body into a usable JS object
    const data = await response.json();

    // response.ok is true for status codes 200–299 (success)
    // If the city isn't found, the API returns status 404
    // with a JSON body — response.ok will be false
    if (!response.ok) {
      // data.message is the error text the API sends back
      // e.g. "city not found"
      throw new Error(data.message || "Something went wrong.");
    }

    // If we get here, the request was successful!
    // Hide the status message and display the weather card
    hideStatus();
    displayWeather(data);

  } catch (error) {
    // Something went wrong — show the error message
    // error.message is whatever we threw above, or a
    // network error if the user has no internet
    showStatus(error.message, "error");
  }
}


// ================================================
// DISPLAY WEATHER
// Takes the raw data object from the API and
// fills in all the elements on the page.
//
// The API response looks like this (simplified):
// {
//   name: "Lagos",
//   sys: { country: "NG" },
//   weather: [{ description: "light rain", icon: "10d" }],
//   main: { temp: 28, feels_like: 31, humidity: 80 },
//   wind: { speed: 5.2 },
//   visibility: 8000
// }
// ================================================

function displayWeather(data) {

  // --- Location ---
  cityName.textContent    = data.name;
  countryCode.textContent = data.sys.country;

  // --- Icon ---
  // The API gives us an icon code like "10d" (rain, daytime)
  // We plug that into their icon URL to get the actual image
  const iconCode = data.weather[0].icon;
  weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  weatherIcon.alt = data.weather[0].description;

  // --- Temperature ---
  // Math.round() removes the decimal — "28°C" not "28.3°C"
  temperature.textContent = `${Math.round(data.main.temp)}°C`;

  // --- Description ---
  // data.weather is an array — we always want the first item [0]
  weatherDesc.textContent = data.weather[0].description;

  // --- Detail items ---
  feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
  humidity.textContent  = `${data.main.humidity}%`;

  // Wind speed comes in m/s — we convert to km/h by multiplying by 3.6
  windSpeed.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;

  // Visibility comes in metres — we convert to km by dividing by 1000
  visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;

  // Now reveal the weather card
  weatherSection.hidden = false;
}


// ================================================
// SHOW STATUS
// A helper function to display a message in the
// status section. The type parameter is either
// "error" or "loading" — it controls the color
// via CSS (remember the .error class in style.css).
// ================================================

function showStatus(message, type) {
  statusMessage.textContent = message;

  // Add or remove the "error" class based on type
  if (type === "error") {
    statusMessage.classList.add("error");
  } else {
    statusMessage.classList.remove("error");
  }

  // Make the status section visible
  statusSection.hidden = false;
}


// ================================================
// HIDE STATUS
// Called after a successful fetch — clears and
// hides the status message so it doesn't sit
// on top of the weather card.
// ================================================

function hideStatus() {
  statusSection.hidden = true;
  statusMessage.textContent = "";
  statusMessage.classList.remove("error");
}