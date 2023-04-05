import { format, isToday } from 'date-fns'
import { events } from "../pub-sub"
import { createHTML } from "../global-functions"
import './dashboard.css'

export const getWeatherFormModule = function(body) {

    const getWeatherForm = createHTML(`
        <form>
            <label style="display: none" for="city-zip-code">City or Zip code</label>
            <input type="text" id="location-input" name="city-zip-code" placeholder="City or Zip"/>
            <button id="get-weather-form-button">Submit</button>
        </form>
    `)

    body.appendChild(getWeatherForm)

    //Cache HTML
    const locationInput = document.getElementById('location-input')
    const button = document.querySelector('button')

    //Bind Events
    button.addEventListener('click', (e) => {
        e.preventDefault()
        if (locationInput.value === '') {
            return
        }
        const location = parseInput(locationInput.value)
        locationInput.value = null
        events.emit('locationSubmitted', location)
    })

    //Utility
    function parseInput(input) {
        if (input.indexOf(',') > -1) {
            input = input.split(',')
            input = input.map(item => item.trim())
            input[0] = input[0].replace(/\s+/g, '+')
            const location = {
                city: input[0],
                state: input[1]
            }
            return location
        } else {
            input = input.trim()
            input = input.replace(/\s+/g, '+')
            const location = {
                city: input
            }
            return location
        }
    }

}

export const currentWeatherModule = function(body) {

    const currentWeatherSection = createHTML(`
        <div class="current-weather-section"></div>
    `)

    const currentWeatherTicket = createHTML(`
        <div class="current-weather-ticket">
            <div class="city-name"></div>
            <div class="current-temp" style="margin-right: -15px"></div>
            <div class="current-weather" style="margin: 2px"></div>
            <div class="min-max-container">
                <div class="max-temp"></div>
                <div class="min-temp"></div>
            </div>
        </div>
    `)

    body.appendChild(currentWeatherSection)
    currentWeatherSection.appendChild(currentWeatherTicket)

    //Cache HTML
    const cityName = document.querySelector('.city-name')
    const currentTemp = document.querySelector('.current-temp')
    const currentWeather = document.querySelector('.current-weather')
    const maxTemp = document.querySelector('.max-temp')
    const minTemp = document.querySelector('.min-temp')

    //Bind Events
    events.on('weatherDataRecieved', function(data) {
        setCurrentWeather(data)
        setBackground(data)
    })

    //Utility
    function setCurrentWeather(data) {
        cityName.textContent = data.cityName
        currentTemp.textContent = `${Math.round(data.current_weather.temperature)}°`
        currentWeather.textContent = convertWeatherCode(data.current_weather.weathercode)
        maxTemp.textContent = `Max:${Math.round(data.daily.temperature_2m_max[0])}°`
        minTemp.textContent = `Min:${Math.round(data.daily.temperature_2m_min[0])}°`
    }

    function setBackground(data) {
        const currentHour = Number(format(new Date(data.current_weather.time), 'H'))
        const sunsetHour = Number(format(new Date(data.daily.sunset[0]), 'H'))
        const sunriseHour = Number(format(new Date(data.daily.sunrise[0]), 'H'))
        if (currentHour > sunriseHour && currentHour < sunsetHour) {
            body.id = 'day-background'
        } else {
            body.id = 'night-background'
        } 
        if (currentHour === sunriseHour || currentHour === sunsetHour) {
            body.id = 'sunrise-sunset-background'
        }
    }

    function convertWeatherCode(weatherCode) {
        if (weatherCode === 0) {
            return 'Clear sky'
        }
        if (weatherCode === 1) {
            return 'Mainly clear'
        }
        if (weatherCode === 2) {
            return 'Partly cloudy'
        }
        if (weatherCode === 3) {
            return 'Overcast'
        }
        if (weatherCode === 45 || weatherCode === 48) {
            return 'Fog'
        }
        if (weatherCode === 51 || weatherCode === 53 || weatherCode === 55) {
            return 'Drizzle'
        }
        if (weatherCode === 56 || weatherCode === 57) {
            return 'Freezing drizzle'
        }
        if (weatherCode === 61 || weatherCode === 63 || weatherCode === 65 || weatherCode === 80 || weatherCode === 81 || weatherCode === 82) {
            return 'Rain'
        }
        if (weatherCode === 66 || weatherCode === 67) {
            return 'Freezing rain'
        }
        if (weatherCode === 71 || weatherCode === 73 || weatherCode === 75 || weatherCode === 85 || weatherCode === 86) {
            return 'Snow'
        }
        if (weatherCode === 95 || weatherCode === 96 || weatherCode === 99) {
            return 'Thunderstorm'
        }
    }

}

export const hourlyForecastModule = function(body) {

    const hourlyForecastSection = createHTML(`
        <div class="hourly-forecast-section"></div>
    `)

    const hourlyForecast = createHTML(`
        <div class="hourly-forecast">
            <div class="hourly-forecast-header">Hourly Forecast</div>
            <div class="hourly-forecast-ticket-container"></div>
        </div>
    `)

    function createHourlyForecastTicket() {
        const hourlyForecastTicket = createHTML(`
            <div class="hourly-forecast-ticket">
                <div class="hourly-forecast-ticket-time"></div>
                <div class="hourly-forecast-ticket-icon"></div>
                <div class="hourly-forecast-ticket-temp" style="display: flex; justify-content:center"></div>
            </div>
        `)
        return hourlyForecastTicket
    }

    body.appendChild(hourlyForecastSection)
    hourlyForecastSection.appendChild(hourlyForecast)

    //Cache HTML
    const hourlyForecastTicketContainer = document.querySelector('.hourly-forecast-ticket-container')

    events.on('weatherDataRecieved', function(data) {
        hourlyForecast.setAttribute('style', 'opacity: 1')
        while(hourlyForecastTicketContainer.hasChildNodes()) {
            hourlyForecastTicketContainer.removeChild(hourlyForecastTicketContainer.lastChild)
        }
        const currentHour = Number(format(new Date(data.current_weather.time), 'H'))
        const nextTwentyFourHours = {
            weathercode: data.hourly.weathercode.slice(currentHour, currentHour + 24),
            time: data.hourly.time.slice(currentHour, currentHour + 24),
            temp: data.hourly.temperature_2m.slice(currentHour, currentHour + 24)
        }
        for (let i = 0; i < 24; i++) {
            const newTicket = createHourlyForecastTicket()
            const currentLoopHour = Number(format(new Date(nextTwentyFourHours.time[i]), 'H'))
            const iconClass = getIconClass(data, nextTwentyFourHours.weathercode[i], currentLoopHour)
            newTicket.children[0].textContent = convertTime(currentLoopHour, currentHour)
            newTicket.children[1].classList.add(iconClass.weather, iconClass.partOfDay)
            newTicket.children[2].textContent = `${Math.round(nextTwentyFourHours.temp[i])}°`
            hourlyForecastTicketContainer.appendChild(newTicket)
            const sunriseSunsetTicket = createSunriseSunsetTicket(data, currentLoopHour)
            if (sunriseSunsetTicket !== null) {
                hourlyForecastTicketContainer.appendChild(sunriseSunsetTicket)
            }
        }
    })

    //Utility
    function convertTime(currentLoopHour, currentHour) {
        if (currentLoopHour === currentHour) {
            return 'Now'
        } else {
            return `${format(new Date(`1/1/1111 ${currentLoopHour}:00`), 'haa')}`//Date is arbitrary
        }
    }

    function getIconClass(data, weathercode, currentLoopHour) {
        const weather = convertWeatherCode(weathercode)
        const partOfDay = getDayNight(data, currentLoopHour)
        return {
            weather,
            partOfDay
        }
    }

    function getDayNight(data, currentLoopHour) {
        const sunsetHour = Number(format(new Date(data.daily.sunset[0]), 'H'))
        const sunriseHour = Number(format(new Date(data.daily.sunrise[0]), 'H'))
        if (currentLoopHour > sunriseHour && currentLoopHour <= sunsetHour) {
            return ('day')
        } else {
            return ('night')
        }
    }

    function createSunriseSunsetTicket(data, currentLoopHour) {
        const sunsetHour = Number(format(new Date(data.daily.sunset[0]), 'H'))
        const sunriseHour = Number(format(new Date(data.daily.sunrise[0]), 'H'))
        if (currentLoopHour === sunriseHour) {
            const sunriseTicket = createHourlyForecastTicket()
            sunriseTicket.children[0].textContent = `${format(new Date(data.daily.sunrise[0]), 'h:mmaa')}`
            sunriseTicket.children[1].classList.add('sunrise-sunset')
            sunriseTicket.children[2].textContent = 'Sunrise'
            return sunriseTicket
        }
        if (currentLoopHour === sunsetHour) {
            const sunsetTicket = createHourlyForecastTicket()
            sunsetTicket.children[0].textContent = `${format(new Date(data.daily.sunset[0]), 'h:mmaa')}`
            sunsetTicket.children[1].classList.add('sunrise-sunset')
            sunsetTicket.children[2].textContent = 'Sunset'
            return sunsetTicket
        }
        return null
    }

}

export const dailyForecastModule = function(body) {

    const dailyForecastSection = createHTML(`
        <div class="daily-forecast-section"></div>
    `)

    const dailyForecast = createHTML(`
        <div class="daily-forecast">
            <div class="daily-forecast-header">7 Day Forecast</div>
            <div class="daily-forecast-ticket-container"></div>
        </div>
    `)

    function createDailyForecastTicket() {
        const dailyForecastTicket = createHTML(`
            <div class="daily-forecast-ticket">
                <div class="daily-forecast-ticket-day"></div>
                <div class="daily-forecast-ticket-icon"></div>
                <div style="display: flex; justify-content: space-between; width: 5rem;">
                    <div class="daily-forecast-ticket-min-temp"></div>
                    <div class="daily-forecast-ticket-max-temp"></div>
                </div>
            </div>
        `)
        return dailyForecastTicket
    }

    body.appendChild(dailyForecastSection)
    dailyForecastSection.appendChild(dailyForecast)

    //Cache HTML
    const dailyForecastTicketContainer = document.querySelector('.daily-forecast-ticket-container')

    events.on('weatherDataRecieved', function(data) {
        while(dailyForecastTicketContainer.hasChildNodes()) {
            dailyForecastTicketContainer.removeChild(dailyForecastTicketContainer.lastChild)
        }
        dailyForecast.setAttribute('style', 'opacity: 1')
        const dailyForecastData = {
            dates: data.daily.time,
            maxTemp: data.daily.temperature_2m_max,
            minTemp: data.daily.temperature_2m_min,
            weathercode: data.daily.weathercode
        }
        for (let i = 0; i < 7; i++) {
            const newTicket = createDailyForecastTicket()
            const iconClass = convertWeatherCode(dailyForecastData.weathercode[i])
            newTicket.children[0].textContent = convertDate(dailyForecastData.dates[i])
            newTicket.children[1].classList.add(iconClass)
            newTicket.children[2].children[0].textContent = `${Math.round(dailyForecastData.minTemp[i])}°`
            newTicket.children[2].children[1].textContent = `${Math.round(dailyForecastData.maxTemp[i])}°`
            dailyForecastTicketContainer.appendChild(newTicket)
        }
    })

    //Utility
    function convertDate(date) {
        if (isToday(new Date(`${date} 1:00 PM`))) {//Time is arbitrary
            return 'Today'
        }
        let day
        switch(new Date(date).getUTCDay()) {
            case 0:
                day = "Sun";
                break;
            case 1:
                day = "Mon";
                break;
            case 2:
                day = "Tue";
                break;
            case 3:
                day = "Wed";
                break;
            case 4:
                day = "Thu";
                break;
            case 5:
                day = "Fri";
                break;
            case 6:
                day = "Sat";
        }
        return day
    }

}

//Utility
function convertWeatherCode(weatherCode) {
    let iconClass
    switch(weatherCode) {
        case 0: case 1:
            iconClass = 'clear-sky'
            break
        case 2:
            iconClass = 'partially-cloudy'
            break
        case 3: case 45: case 48:
            iconClass = 'cloudy'
            break
        case 51: case 53: case 55: case 56: case 57: case 61: case 63: case 65: case 80: case 81: case 82: case 66: case 67:
            iconClass = 'raining'
            break
        case 71: case 73: case 75: case 85: case 86:
            iconClass = 'snowing'
            break
        case 95: case 96: case 99:
            iconClass = 'storm'
    }
    return iconClass
}
