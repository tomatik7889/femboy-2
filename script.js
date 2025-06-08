document.addEventListener('DOMContentLoaded', function() {
    // Конфігурація
    const apiKey = '2adac79368d84a468bf133523252505';
    const weekDays = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'];
    const months = ['Січня', 'Лютого', 'Березня', 'Квітня', 'Травня', 'Червня', 'Липня', 'Серпня', 'Вересня', 'Жовтня', 'Листопада', 'Грудня'];
    
    // Елементи DOM
    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');
    const currentWeather = document.getElementById('current-weather');
    const errorMessage = document.getElementById('error-message');
    const loading = document.getElementById('loading');
    const hourlyBtn = document.getElementById('hourly-btn');
    const dailyBtn = document.getElementById('daily-btn');
    const hourlyForecast = document.getElementById('hourly-forecast');
    const dailyForecast = document.getElementById('daily-forecast');
    const hourlyScroll = document.getElementById('hourly-scroll');
    const forecastDays = document.getElementById('forecast-days');
    
    // Поточні дані
    let weatherData = null;
    
    // Ініціалізація
    init();
    
    function init() {
        // Обробники подій
        searchBtn.addEventListener('click', getWeather);
        cityInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') getWeather();
        });
        
        hourlyBtn.addEventListener('click', () => switchTab('hourly'));
        dailyBtn.addEventListener('click', () => switchTab('daily'));
        
        // Завантажити погоду за замовчуванням
        cityInput.value = "Київ";
        getWeather();
    }
    
    function getWeather() {
        const city = cityInput.value.trim();
        
        if (!city) {
            showError("Будь ласка, введіть назву міста");
            return;
        }
        
        // Показати завантаження
        currentWeather.classList.add('hidden');
        hourlyForecast.classList.add('hidden');
        dailyForecast.classList.add('hidden');
        errorMessage.classList.add('hidden');
        loading.classList.remove('hidden');
        
        // Отримати поточну погоду та прогноз
        fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=7&lang=uk`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.status === 400 ? "Місто не знайдено" : "Помилка сервера");
                }
                return response.json();
            })
            .then(data => {
                weatherData = data;
                updateUI();
            })
            .catch(error => {
                console.error('Помилка:', error);
                showError(error.message || "Не вдалося отримати дані про погоду");
            })
            .finally(() => {
                loading.classList.add('hidden');
            });
    }
    
    function updateUI() {
        if (!weatherData) return;
        
        // Оновити поточну погоду
        updateCurrentWeather();
        
        // Оновити прогнози
        updateHourlyForecast();
        updateDailyForecast();
        
        // Змінити фон відповідно до погоди
        updateBackground();
        
        // Показати інтерфейс
        currentWeather.classList.remove('hidden');
        switchTab('hourly');
    }
    
    function updateCurrentWeather() {
        const { location, current } = weatherData;
        const now = new Date();
        
        // Оновити дату
        document.getElementById('current-date').textContent = formatDate(now);
        
        // Оновити основну інформацію
        document.getElementById('city-name').textContent = `${location.name}, ${location.country}`;
        document.getElementById('temperature').textContent = `${Math.round(current.temp_c)}°`;
        document.getElementById('description').textContent = current.condition.text;
        
        // Оновити іконку
        const icon = document.getElementById('weather-icon');
        icon.src = `https:${current.condition.icon}`;
        icon.alt = current.condition.text;
        
        // Оновити деталі
        document.getElementById('humidity').textContent = `${current.humidity}%`;
        document.getElementById('pressure').textContent = `${current.pressure_mb} гПа`;
        document.getElementById('wind').textContent = `${current.wind_kph} км/год`;
        document.getElementById('feels-like').textContent = `${Math.round(current.feelslike_c)}°`;
    }
    
    function updateHourlyForecast() {
        if (!weatherData.forecast) return;
        
        hourlyScroll.innerHTML = '';
        const now = new Date();
        const currentHour = now.getHours();
        
        // Показати прогноз на наступні 24 години
        for (let i = 0; i < 24; i++) {
            const hour = (currentHour + i) % 24;
            const forecast = weatherData.forecast.forecastday[Math.floor((currentHour + i) / 24)].hour[hour];
            
            const hourItem = document.createElement('div');
            hourItem.className = 'hourly-item';
            hourItem.innerHTML = `
                <div class="hourly-time">${hour}:00</div>
                <img class="hourly-icon" src="https:${forecast.condition.icon}" alt="${forecast.condition.text}">
                <div class="hourly-temp">${Math.round(forecast.temp_c)}°</div>
            `;
            
            hourlyScroll.appendChild(hourItem);
        }
    }
    
    function updateDailyForecast() {
        if (!weatherData.forecast) return;
        
        forecastDays.innerHTML = '';
        const today = new Date();
        
        weatherData.forecast.forecastday.forEach((day, index) => {
            const date = new Date(day.date);
            const dayName = index === 0 ? 'Сьогодні' : weekDays[date.getDay()];
            
            const dayItem = document.createElement('div');
            dayItem.className = 'forecast-day';
            dayItem.innerHTML = `
                <div class="day-name">${dayName}</div>
                <div class="day-date">${date.getDate()} ${months[date.getMonth()]}</div>
                <img class="forecast-icon" src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
                <div class="forecast-temp">
                    <span class="max-temp">${Math.round(day.day.maxtemp_c)}°</span>
                    <span class="min-temp">${Math.round(day.day.mintemp_c)}°</span>
                </div>
            `;
            
            forecastDays.appendChild(dayItem);
        });
    }
    
    function updateBackground() {
        const condition = weatherData.current.condition.text.toLowerCase();
        const body = document.body;
        
        // Видалити всі класи погоди
        body.classList.remove('clear', 'clouds', 'rain', 'snow', 'thunderstorm', 'default');
        
        // Додати відповідний клас
        if (condition.includes('ясно') || condition.includes('сонячно')) {
            body.classList.add('clear');
        } else if (condition.includes('хмар') || condition.includes('пасмурно')) {
            body.classList.add('clouds');
        } else if (condition.includes('дощ') || condition.includes('злива')) {
            body.classList.add('rain');
        } else if (condition.includes('сніг') || condition.includes('опади')) {
            body.classList.add('snow');
        } else if (condition.includes('гроза') || condition.includes('блискавка')) {
            body.classList.add('thunderstorm');
        } else {
            body.classList.add('default');
        }
    }
    
    function switchTab(tab) {
        if (tab === 'hourly') {
            hourlyBtn.classList.add('active');
            dailyBtn.classList.remove('active');
            hourlyForecast.classList.remove('hidden');
            dailyForecast.classList.add('hidden');
        } else {
            hourlyBtn.classList.remove('active');
            dailyBtn.classList.add('active');
            hourlyForecast.classList.add('hidden');
            dailyForecast.classList.remove('hidden');
        }
    }
    
    function formatDate(date) {
        return `${weekDays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }
    
    function showError(message) {
        currentWeather.classList.add('hidden');
        hourlyForecast.classList.add('hidden');
        dailyForecast.classList.add('hidden');
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }
});

