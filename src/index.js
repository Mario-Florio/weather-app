import { events } from './pub-sub';
import { createHTML, createPage, render } from './global-functions';
import { tag } from './fetch-weather-data';
import './styles.css';
import { getWeatherFormModule, currentWeatherModule, hourlyForecastModule, dailyForecastModule } from './dashboard/dashboard';

const body = document.querySelector('body')

getWeatherFormModule(body)
currentWeatherModule(body)
hourlyForecastModule(body)
dailyForecastModule(body)