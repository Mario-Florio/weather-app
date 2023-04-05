import { events } from "./pub-sub";'./pub-sub'

export const tag = ''

function fulfilled(data) {
    events.emit('weatherDataRecieved', data)
}

function rejected(err) {
    console.error(err)
}

async function getCoordinates(location) {
    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${location.city}&language=en&count=10&format=json`, {mode: 'cors'});
        const data = await response.json()
        const locationData = parseData(location, data)
        return locationData
    } catch(err) {
        console.error(err)
    }
}

async function getWeatherData(latitude, longitude, cityName) {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&temperature_unit=fahrenheit&forecast=7&current_weather=true&hourly=temperature_2m,rain,weathercode&timezone=auto&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset`, {mode: 'cors'});
        const data = await response.json();
        if (response.status === 200) {
            data.cityName = cityName
            fulfilled(data)
        } else {//Catches successfull fetches that return Error
            console.error(`ServerError ${response.status}: ${data.reason}`)
        }
    } catch(err) {//Cathes Fetch Errors
        rejected(err)
    }
}

//Bind Events

events.on('locationSubmitted', function(location) {
    (async function() {
        const locationData = await getCoordinates(location)
        await getWeatherData(locationData.latitude, locationData.longitude, locationData.cityName)
    })();
})

//Utiliy

function parseData(location, data) {
    if (location.state) {
        const stateSpecificData = data.results.find(result => result.admin1 === location.state ? result: false)
        const latitude = stateSpecificData.latitude
        const longitude = stateSpecificData.longitude
        const cityName = stateSpecificData.name
        return {
            latitude,
            longitude,
            cityName
        }
    }
    const latitude = data.results[0].latitude
    const longitude = data.results[0].longitude
    const cityName = data.results[0].name
    return {
        latitude,
        longitude,
        cityName
    }
}