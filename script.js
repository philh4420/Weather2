document.addEventListener("DOMContentLoaded", function () {
  const apiKey = '3c98bb98b1eb5e88ff74beba510dd2fb'; // OpenWeather API key
  const weatherApiKey = 'c4cd227ed7784f89a5e112230240504'; // Weather API key
  const locationInput = document.getElementById('locationInput');
  const searchButton = document.getElementById('searchButton');
  const locationElement = document.getElementById('location');
  const temperatureElement = document.getElementById('temperature');
  const conditionElement = document.getElementById('condition');
  const iconElement = document.getElementById('icon');
  const windSpeedElement = document.getElementById('windSpeed');
  const windDirectionElement = document.getElementById('windDirection');
  const humidityElement = document.getElementById('humidity');
  const pressureElement = document.getElementById('pressure');
  const feelsLikeElement = document.getElementById('feelsLike');
  const visibilityElement = document.getElementById('visibility');
  const cloudCoverElement = document.getElementById('cloudCover');
  const precipitationElement = document.getElementById('precipitation');
  const uvIndexElement = document.getElementById('uvIndex');
  const forecastElement = document.getElementById('forecast');
  const hourlyForecastElement = document.getElementById('hourly-forecast');
  const { DateTime } = luxon;

  function fetchWeatherData(latitude, longitude) {
    const currentApiUrl = `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${latitude},${longitude}&aqi=no`;
    const dailyApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
    const hourlyApiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${latitude},${longitude}&hours=24`;

    axios.all([axios.get(currentApiUrl), axios.get(dailyApiUrl), axios.get(hourlyApiUrl)])
      .then(axios.spread((currentResponse, dailyResponse, hourlyResponse) => {
        updateCurrentWeather(currentResponse.data);
        updateDailyForecast(dailyResponse.data);
        updateHourlyForecast(hourlyResponse.data);
      }))
      .catch(error => {
        console.error('There was a problem fetching the weather data:', error);
      });
  }

  function updateCurrentWeather(data) {
    if (locationElement && temperatureElement && conditionElement && iconElement && windSpeedElement && windDirectionElement && humidityElement && pressureElement && feelsLikeElement && visibilityElement && cloudCoverElement && precipitationElement && uvIndexElement) {
      locationElement.textContent = data.location.name;
      temperatureElement.textContent = data.current.temp_c;
      conditionElement.textContent = data.current.condition.text;
      const iconUrl = data.current.condition.icon;
      iconElement.style.backgroundImage = `url(${iconUrl})`;
      iconElement.alt = data.current.condition.text;
      windSpeedElement.textContent = data.current.wind_kph;
      windDirectionElement.textContent = data.current.wind_dir;
      humidityElement.textContent = data.current.humidity;
      pressureElement.textContent = data.current.pressure_mb;
      feelsLikeElement.textContent = data.current.feelslike_c;
      visibilityElement.textContent = data.current.vis_km;
      cloudCoverElement.textContent = data.current.cloud;
      precipitationElement.textContent = data.current.precip_mm;
      uvIndexElement.textContent = data.current.uv;
    } else {
      console.error('One or more HTML elements not found in the DOM.');
    }
  }

  function fetchHourlyForecast(latitude, longitude) {
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${latitude},${longitude}&hours=24`;

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        updateHourlyForecast(data);
      })
      .catch(error => {
        console.error('There was a problem fetching the hourly forecast data:', error);
      });
  }

  function updateHourlyForecast(data) {
    if (hourlyForecastElement) {
      const hourlyForecast = data.forecast.forecastday[0].hour; // Hourly forecast data is in the 'hour' property
      if (!hourlyForecast) {
        console.error('Hourly forecast data is missing or empty');
        return;
      }

      hourlyForecastElement.innerHTML = '';
      const hourlyForecastTitle = document.createElement('h1');
      hourlyForecastTitle.textContent = 'Hourly Forecast';

      hourlyForecast.forEach(hour => {
        const time = DateTime.fromSeconds(hour.time_epoch).toFormat('HH:mm'); // Format time using Luxon
        const hourItem = document.createElement('div');
        hourItem.classList.add('hourly-forecast-item');
        hourItem.innerHTML = `
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Temperature:</strong> ${hour.temp_c} °C</p>
          <p><strong>Feels Like:</strong> ${hour.feelslike_c} °C</p>
          <p><strong>Condition:</strong> ${hour.condition.text}</p>
          <p><strong>Wind Speed:</strong> ${hour.wind_kph} km/h</p>
          <p><strong>Wind Direction:</strong> ${hour.wind_dir}</p>
          <p><strong>Humidity:</strong> ${hour.humidity}%</p>
          <p><strong>Precipitation:</strong> ${hour.precip_mm} mm</p>
          <img src="${hour.condition.icon}" alt="${hour.condition.text}">
        `;
        hourlyForecastElement.appendChild(hourItem);
      });
    } else {
      console.error('Hourly forecast element not found in the DOM.');
    }
  }

  function updateDailyForecast(data) {
    if (forecastElement) {
      const forecastData = data.list;
      if (!forecastData) {
        console.error('Forecast data is missing or empty');
        return;
      }

      // Filter out the current day's data
      const filteredForecastData = forecastData.filter(item => {
        const itemDate = new Date(item.dt * 1000);
        const today = new Date();
        return itemDate.getDate() !== today.getDate();
      });

      forecastElement.innerHTML = '';
      const forecastTitle = document.createElement('h1');
      forecastTitle.textContent = '10-Day Forecast';

      function formatUKDate(dateString) {
        const date = new Date(dateString * 1000); // Convert Unix timestamp to milliseconds
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return `${date.toLocaleDateString('en-GB', options)}`;
      }

      // Group the filtered forecast data by date
      const forecastByDate = filteredForecastData.reduce((acc, curr) => {
        const date = formatUKDate(curr.dt);
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(curr);
        return acc;
      }, {});

      // Iterate over the grouped forecast data
      Object.entries(forecastByDate).forEach(([date, dailyForecast]) => {
        const maxTemp = Math.max(...dailyForecast.map(item => item.main.temp_max));
        const minTemp = Math.min(...dailyForecast.map(item => item.main.temp_min));
        const condition = dailyForecast[0].weather[0];

        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Max Temperature:</strong> ${maxTemp} °C</p>
          <p><strong>Min Temperature:</strong> ${minTemp} °C</p>
          <p><strong>Condition:</strong> ${condition.description}</p>
          <img src="https://openweathermap.org/img/w/${condition.icon}.png" alt="${condition.description}">
        `;
        forecastElement.appendChild(forecastItem);
      });
    } else {
      console.error('Forecast element not found in the DOM.');
    }
  }

  // Fetch the user's current location weather on page load
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherData(latitude, longitude);
        fetchHourlyForecast(latitude, longitude);
      },
      (error) => {
        console.error('Error getting user location:', error);
      }
    );
  } else {
    console.error('Geolocation is not supported by this browser.');
  }

  searchButton.addEventListener('click', function () {
    const location = locationInput.value.trim();
    if (location) {
      fetchWeatherData(location);
    } else {
      alert('Please enter a location');
    }
  });
});
