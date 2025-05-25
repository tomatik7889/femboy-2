document.addEventListener('DOMContentLoaded', function() {
    const apiKey = 'd9e45b6c83814369a3b140644252505';
    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');
    const currentWeather = document.getElementById('current-weather');
    const forecast = document.getElementById('forecast');
    const errorMessage = document.getElementById('error-message');
    const loading = document.getElementById('loading');
    
    
    const weekDays = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    
    searchBtn.addEventListener('click', getWeather);
    cityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') getWeather();
    });
    
    function getWeather() {
        const city = cityInput.value.trim();
        
        if (!city) {
            showError("Будь ласка, введіть назву міста");
            return;
        }
        
        
        currentWeather.classList.add('hidden');
        forecast.classList.add('hidden');
        errorMessage.classList.add('hidden');
        loading.classList.remove('hidden');
        
        
        fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&lang=uk`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.status === 400 ? "Місто не знайдено" : "Помилка сервера");
                }
                return response.json();
            })
            .then(currentData => {
                
                return fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=7&lang=uk`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("Не вдалося отримати прогноз");
                        }
                        return response.json();
                    })
                    .then(forecastData => {
                        return { current: currentData, forecast: forecastData };
                    });
            })
            .then(data => {
                displayCurrentWeather(data.current);
                displayForecast(data.forecast);
            })
            .catch(error => {
                console.error('Помилка:', error);
                showError(error.message || "Не вдалося отримати дані про погоду");
            })
            .finally(() => {
                loading.classList.add('hidden');
            });
    }
    
    function displayCurrentWeather(data) {
        errorMessage.classList.add('hidden');
        
        const location = data.location;
        const current = data.current;
        
        document.getElementById('city-name').textContent = `${location.name}, ${location.country}`;
        document.getElementById('temperature').textContent = `${Math.round(current.temp_c)}°`;
        document.getElementById('description').textContent = current.condition.text;
        document.getElementById('humidity').textContent = `${current.humidity}%`;
        document.getElementById('pressure').textContent = `${current.pressure_mb} гПа`;
        document.getElementById('wind').textContent = `${current.wind_kph} км/год`;
        document.getElementById('feels-like').textContent = `${Math.round(current.feelslike_c)}°`;
        
        document.getElementById('weather-icon').src = `https:${current.condition.icon}`;
        document.getElementById('weather-icon').alt = current.condition.text;
        
        currentWeather.classList.remove('hidden');
    }
    
    function displayForecast(data) {
        const forecastDays = document.getElementById('forecast-days');
        forecastDays.innerHTML = '';
        
        const forecastData = data.forecast.forecastday;
        
        forecastData.forEach((day, index) => {
            const date = new Date(day.date);
            const dayName = index === 0 ? 'Сьогодні' : weekDays[date.getDay()];
            
            const forecastDay = document.createElement('div');
            forecastDay.className = 'forecast-day';
            forecastDay.innerHTML = `
                <div class="day-name">${dayName}</div>
                <img class="forecast-icon" src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
                <div class="forecast-temp">
                    <span class="max-temp">${Math.round(day.day.maxtemp_c)}°</span>
                    <span class="min-temp">${Math.round(day.day.mintemp_c)}°</span>
                </div>
            `;
            
            forecastDays.appendChild(forecastDay);
        });
        
        forecast.classList.remove('hidden');
    }
    
    function showError(message) {
        currentWeather.classList.add('hidden');
        forecast.classList.add('hidden');
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }
    
    
    cityInput.value = "Київ";
    getWeather();
});