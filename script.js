document.addEventListener('DOMContentLoaded', function() {
    const apiKey = 'd9e45b6c83814369a3b140644252505';
    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');
    const weatherInfo = document.getElementById('weather-info');
    const errorMessage = document.getElementById('error-message');
    const loading = document.getElementById('loading');
    
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
        
        // Показуємо завантаження
        weatherInfo.classList.add('hidden');
        errorMessage.classList.add('hidden');
        loading.classList.remove('hidden');
        
        fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&lang=uk`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.status === 400 ? "Місто не знайдено" : "Помилка сервера");
                }
                return response.json();
            })
            .then(data => {
                displayWeather(data);
            })
            .catch(error => {
                console.error('Помилка:', error);
                showError(error.message || "Не вдалося отримати дані про погоду");
            })
            .finally(() => {
                loading.classList.add('hidden');
            });
    }
    
    function displayWeather(data) {
        errorMessage.classList.add('hidden');
        
        const location = data.location;
        const current = data.current;
        
        document.getElementById('city-name').textContent = `${location.name}, ${location.country}`;
        document.getElementById('temperature').textContent = `${Math.round(current.temp_c)}°C`;
        document.getElementById('description').textContent = current.condition.text;
        document.getElementById('humidity').textContent = `${current.humidity}%`;
        document.getElementById('pressure').textContent = `${current.pressure_mb} hPa`;
        document.getElementById('wind').textContent = `${current.wind_kph} км/год, ${current.wind_dir}`;
        document.getElementById('feels-like').textContent = `${Math.round(current.feelslike_c)}°C`;
        document.getElementById('clouds').textContent = `${current.cloud}%`;
        document.getElementById('visibility').textContent = `${current.vis_km} км`;
        
        document.getElementById('weather-icon').src = `https:${current.condition.icon}`;
        document.getElementById('weather-icon').alt = current.condition.text;
        
        weatherInfo.classList.remove('hidden');
    }
    
    function showError(message) {
        weatherInfo.classList.add('hidden');
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }
    
    // Завантажити погоду для Києва за замовчуванням
    cityInput.value = "Kyiv";
    getWeather();
});