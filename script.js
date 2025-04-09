// Select DOM elements for city input, search button, weather cards container, and current weather container
const cityInput = document.querySelector(".cityInput");
const searchButton = document.querySelector(".search");
const weatherCardsDiv = document.querySelector(".weather-cards");
const currentweatherCardsDiv = document.querySelector(".currunt-weather");
const locationBtn = document.querySelector(".locationbtn");

// API key for OpenWeatherMap
const API_KEY = 'c38e161403a7030583d18a36b90f2ac5';

// Function to create a weather card (either current or forecasted weather)
const createWeatherCard = (cityName, weatherItem, index) => {
  const date = new Date(weatherItem.dt_txt);
  const formattedDate = date.toLocaleDateString(); // Format date into a readable format

  // If it's the first card (current weather)
  if (index === 0) {
    return `
      <div class="details">
        <h2>${cityName} (${formattedDate})</h2>
        <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
        <h4>Wind Speed: ${weatherItem.wind.speed} M/S</h4>
        <h4>Humidity: ${weatherItem.main.humidity}%</h4>
      </div>
      <div class="icon">
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="icon">
        <h4>${weatherItem.weather[0].description}</h4>
      </div>
    `;
  }

  // For future forecast cards
  return `
    <li class="card">
      <h2>${formattedDate}</h2>
      <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="icon">
      <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
      <h4>Wind Speed: ${weatherItem.wind.speed} M/S</h4>
      <h4>Humidity: ${weatherItem.main.humidity}%</h4>
    </li>
  `;
};

// Function to get weather details based on city coordinates (latitude and longitude)
const getWeatherDetails = async (cityName, lat, lon) => {
  const weatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  try {
    // Fetch the weather forecast data from the OpenWeatherMap API
    const response = await fetch(weatherApiUrl);
    const data = await response.json();

    // Group forecasts by unique days
    const uniqueForecastDays = [...new Set(data.list.map(forecast => new Date(forecast.dt_txt).toLocaleDateString()))];
    const fiveDaysForecast = uniqueForecastDays.map(day => {
      return data.list.find(f => new Date(f.dt_txt).toLocaleDateString() === day);
    });

    // Clear previous search results
    cityInput.value = "";
    currentweatherCardsDiv.innerHTML = "";
    weatherCardsDiv.innerHTML = "";

    // Add current weather card and forecast cards to the DOM
    fiveDaysForecast.forEach((forecast, index) => {
      if (index === 0) {
        // First item is for the current weather
        currentweatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, forecast, index));
      } else {
        // Following items are for the forecasted days
        weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, forecast, index));
      }
    });
  } catch (error) {
    // Error handling: log error and show an alert if data fetching fails
    console.error(error);
    alert("Error fetching weather data");
  }
};

// Function to get city coordinates from the city name
const getCityCoordinates = async () => {
  const cityName = cityInput.value.trim(); // Get the value entered in the city input
  if (!cityName) return; // Exit if no city name is entered

  const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_KEY}`;

  try {
    // Fetch coordinates for the city name from OpenWeatherMap API
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.length) {
      // If no data is returned (city not found), show an alert
      alert(`City not found for ${cityName}`);
      return;
    }

    // Extract latitude and longitude from the first result
    const { lat, lon } = data[0];
    // Fetch weather details using the coordinates
    getWeatherDetails(cityName, lat, lon);
  } catch (error) {
    // Error handling: log error and show an alert if city coordinates fetching fails
    console.error(error);
    alert("Error fetching city coordinates");
  }
};

// Function to get user's current location coordinates
const getusercordinates = () => {
  // Use the browser's geolocation API to get the user's position
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

      try {
        // Fetch city name based on the user's location coordinates (reverse geocoding)
        const response = await fetch(REVERSE_GEOCODING_URL);
        const data = await response.json();

        if (!data.length) {
          // If no city is found, show an alert
          alert("City not found for your location");
          return;
        }

        const cityName = data[0].name;
        // Fetch weather details using the city name and coordinates
        getWeatherDetails(cityName, latitude, longitude);
      } catch (error) {
        // Error handling: log error and show an alert if reverse geocoding fails
        console.error(error);
        alert("Error fetching city coordinates");
      }
    },
    (error) => {
      // Error handling for geolocation errors (e.g., permission denied or unable to get location)
      if (error.code === error.PERMISSION_DENIED) {
        alert("Geolocation request denied. Please reset location permission to grant access again.");
      } else {
        alert("Error getting your location");
      }
    }
  );
};

// Event listener for search button: when clicked, get city coordinates and fetch weather details
searchButton.addEventListener("click", getCityCoordinates);

// Event listener for location button: when clicked, get user's current location and fetch weather details
locationBtn.addEventListener("click", getusercordinates);
