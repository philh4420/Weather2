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
  const humidityElement = document.getElementById('humidity');
  const pressureElement = document.getElementById('pressure');
  const visibilityElement = document.getElementById('visibility');
  const cloudCoverElement = document.getElementById('cloudCover');
  const precipitationElement = document.getElementById('precipitation');
  const uvIndexElement = document.getElementById('uvIndex');
  const forecastElement = document.getElementById('forecast');
  const hourlyForecastElement = document.getElementById('hourly-forecast');
  const { DateTime } = luxon;

  function fetchWeatherData(location) {
    const currentApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;
    const hourlyApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;

    axios.all([axios.get(currentApiUrl), axios.get(hourlyApiUrl)])
      .then(axios.spread((currentResponse, hourlyResponse) => {
        updateCurrentWeather(currentResponse.data);
        fetchHourlyForecast(location); // Fetch hourly forecast from Weather API
        fetchForecast(location);
      }))
      .catch(error => {
        console.error('There was a problem fetching the weather data:', error);
      });
  }

  function fetchHourlyForecast(location) {
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${location}&hours=24`;

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        updateHourlyForecast(data);
      })
      .catch(error => {
        console.error('There was a problem fetching the hourly forecast data:', error);
      });
  }

  function fetchForecast(location) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;

    axios.get(apiUrl)
      .then(response => {
        updateForecast(response.data);
      })
      .catch(error => {
        console.error('There was a problem fetching the forecast data:', error);
      });
  }

  function updateCurrentWeather(data) {
    locationElement.textContent = data.name;
    temperatureElement.textContent = data.main.temp;
    conditionElement.textContent = data.weather[0].description;
    const iconUrl = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;
    iconElement.style.backgroundImage = `url(${iconUrl})`;
    iconElement.alt = data.weather[0].description;
    windSpeedElement.textContent = data.wind.speed;
    humidityElement.textContent = data.main.humidity;
    pressureElement.textContent = data.main.pressure;
    visibilityElement.textContent = data.visibility / 1000; // Convert from meters to kilometers
    cloudCoverElement.textContent = data.clouds.all;
    precipitationElement.textContent = data.rain ? data.rain['1h'] : 0; // Check if rain data exists
  }

  function updateHourlyForecast(data) {
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
        <p><strong>Condition:</strong> ${hour.condition.text}</p>
        <img src="${hour.condition.icon}" alt="${hour.condition.text}">
      `;
      hourlyForecastElement.appendChild(hourItem);
    });
  }

  function updateForecast(data) {
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
