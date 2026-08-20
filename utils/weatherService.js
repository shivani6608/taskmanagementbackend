const axios = require('axios');
const getWeatherByCity = async (city) => {
 if (!city) return null;
 const apiKey = process.env.OPENWEATHER_API_KEY;
 if (!apiKey) return null;
 try {
 const response = await axios.get(
 `https://api.openweathermap.org/data/2.5/weather?
q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
 );
 const { data } = response;
 return {
 temp: Math.round(data.main.temp),
 description: data.weather[0]?.description,
 icon: data.weather[0]?.icon,
 cityName: data.name,
 };
 } catch (error) {
 console.error(`Failed to fetch weather for ${city}:`, error.message);
 return null;
 }
};
module.exports = { getWeatherByCity };