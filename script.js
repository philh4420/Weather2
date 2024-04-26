class WeatherService {
  constructor() {
    // Initialize API keys
    this.weatherApiKey = "c4cd227ed7784f89a5e112230240504";
    this.openWeatherApiKey = "3c98bb98b1eb5e88ff74beba510dd2fb";
  }

  // Method to fetch current weather
  fetchCurrentWeather(location) {
    return fetch(`https://api.weatherapi.com/v1/current.json?key=${this.weatherApiKey}&q=${location}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error fetching current weather: ' + response.status);
        }
        return response.json();
      })
      .catch(error => console.error('Error fetching current weather:', error));
  }

  // Method to fetch hourly forecast
  fetchHourlyForecast(location) {
    return fetch(`https://api.weatherapi.com/v1/forecast.json?key=${this.weatherApiKey}&q=${location}&days=1&aqi=no&alerts=no`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error fetching hourly forecast: ' + response.status);
        }
        return response.json();
      })
      .catch(error => console.error('Error fetching hourly forecast:', error));
  }

  // Method to fetch 5-day forecast
  fetch5DayForecast(latitude, longitude) {
    return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${this.openWeatherApiKey}&units=metric`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error fetching 5-day forecast: ' + response.status);
        }
        return response.json();
      })
      .catch(error => console.error('Error fetching 5-day forecast:', error));
  }

  // Method to fetch astronomy data for sunrise, sunset, and moon phase
  fetchAstronomyData(latitude, longitude) {
    return fetch(`https://api.weatherapi.com/v1/astronomy.json?key=${this.weatherApiKey}&q=${latitude},${longitude}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error fetching astronomy data: ' + response.status);
        }
        return response.json();
      })
      .catch(error => console.error('Error fetching astronomy data:', error));
  }

  // Method to get user's location and fetch weather data
  getUserLocationWeather() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        this.fetchCurrentWeather(`${latitude},${longitude}`)
          .then(data => {
            this.updateCurrentWeatherUI(data);
          });
        this.fetchHourlyForecast(`${latitude},${longitude}`)
          .then(data => {
            this.updateHourlyForecastUI(data);
          });
        this.fetch5DayForecast(latitude, longitude)
          .then(data => {
            this.update5DayForecastUI(data);
          });
        this.fetchAstronomyData(latitude, longitude)
          .then(data => {
            this.updateAstronomyDataUI(data);
          });
      });
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }

  // Method to update UI with current weather data
  updateCurrentWeatherUI(data) {
    // Update HTML elements with current weather data
    const dateTime = new Date().toLocaleString('en-GB', { timeZone: data.location.tz_id });
    document.getElementById('location').textContent = data.location.name;
    document.getElementById('dateTime').textContent = dateTime;
    document.getElementById('temperature').textContent = data.current.temp_c;
    document.getElementById('condition').textContent = data.current.condition.text;
    document.getElementById('windSpeed').textContent = data.current.wind_kph;
    document.getElementById('windDirection').textContent = data.current.wind_dir;
    document.getElementById('humidity').textContent = data.current.humidity;
    document.getElementById('pressure').textContent = data.current.pressure_mb;
    document.getElementById('feelsLike').textContent = data.current.feelslike_c;
    document.getElementById('visibility').textContent = data.current.vis_km;
    document.getElementById('cloudCover').textContent = data.current.cloud;
    document.getElementById('precipitation').textContent = data.current.precip_mm;
    document.getElementById('uvIndex').textContent = data.current.uv;

    // Set the weather icon
    const icon = data.current.condition.icon;
    const iconElement = document.getElementById('icon');
    iconElement.innerHTML = `<img src="${icon}" alt="Weather Icon">`;
  }


  // Method to update UI with hourly forecast data
  updateHourlyForecastUI(data) {
    const hourlyForecast = data.forecast.forecastday[0].hour;
    const hourlyForecastContainer = document.getElementById('hourly-forecast');

    // Clear previous forecast data
    hourlyForecastContainer.innerHTML = '';

    // Loop through hourly forecast data and create HTML elements
    hourlyForecast.forEach(hour => {
      const hourElement = document.createElement('div');
      hourElement.classList.add('hourly-forecast-item');
      hourElement.innerHTML = `
            <p>${hour.time.slice(11, 16)}</p>
            <p>${hour.temp_c} °C</p>
            <img src="${hour.condition.icon}" alt="${hour.condition.text}">
            <p>Wind Speed: ${hour.wind_kph} km/h</p>
            <p>Wind Direction: ${hour.wind_dir}</p>
            <p>Humidity: ${hour.humidity}%</p>
            <p>Feels Like: ${hour.feelslike_c} °C</p>
            <p>Visibility: ${hour.vis_km} km</p>
            <p>Cloud Cover: ${hour.cloud}%</p>
            <p>Precipitation: ${hour.precip_mm} mm</p>
            <p>UV Index: ${hour.uv}</p>
        `;
      hourlyForecastContainer.appendChild(hourElement);
    });
  }



  // Method to update UI with 5-day forecast data
  update5DayForecastUI(data) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = ''; // Clear previous forecast data

    const forecastDates = {}; // Object to track unique forecast dates
    let daysAdded = 0; // Counter to track the number of forecast days added

    const currentDate = new Date();
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(currentDate.getDate() + 1);

    data.list.forEach(entry => {
      const date = new Date(entry.dt * 1000);
      // Check if the date is after tomorrow and not a duplicate date
      if (date > tomorrow && daysAdded < 5) {
        const dateKey = date.toDateString(); // Use date string as a unique key

        // Check if this date hasn't been added yet
        if (!forecastDates[dateKey]) {
          const day = date.toLocaleDateString('en-GB', { weekday: 'short' });

          // Retrieve sunrise, sunset, and moon phase data
          const sunriseTime = new Date(entry.sunrise * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
          const sunsetTime = new Date(entry.sunset * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
          const moonPhase = entry.moon_phase ? entry.moon_phase : 'N/A';

          // Create HTML elements for forecast item
          const forecastItem = document.createElement('div');
          forecastItem.classList.add('forecast-item');
          forecastItem.innerHTML = `
                    <p>${day}</p>
                    <img src="https://openweathermap.org/img/wn/${entry.weather[0].icon}.png" alt="${entry.weather[0].description}">
                    <p>Temperature: ${Math.round(entry.main.temp)} °C</p>
                    <p>Condition: ${entry.weather[0].description}</p>
                    <p>Wind Speed: ${entry.wind.speed} km/h</p>
                    <p>Humidity: ${entry.main.humidity}%</p>
                    <p>Pressure: ${entry.main.pressure} mb</p>
                `;

          // Append forecast item to forecast container
          forecastContainer.appendChild(forecastItem);

          // Mark this date as added
          forecastDates[dateKey] = true;
          daysAdded++;
        }
      }
    });
  }


  // Method to update UI with astronomy data
  updateAstronomyDataUI(data) {
    document.getElementById('sunrise').textContent = data.astronomy.astro.sunrise;
    document.getElementById('sunset').textContent = data.astronomy.astro.sunset;
    document.getElementById('moonPhase').textContent = data.astronomy.astro.moon_phase;
  }
}

// Usage
document.addEventListener("DOMContentLoaded", function () {
  const weatherService = new WeatherService();

  // Initial weather fetch on page load using user's location
  weatherService.getUserLocationWeather();

  // Event listener for search button
  document.getElementById('searchButton').addEventListener('click', function () {
    const location = document.getElementById('locationInput').value;
    weatherService.fetchCurrentWeather(location)
      .then(data => {
        weatherService.updateCurrentWeatherUI(data);
      });
    weatherService.fetchHourlyForecast(location)
      .then(data => {
        weatherService.updateHourlyForecastUI(data);
      });
  });
});
