import React, { useState, useEffect } from "react";
import "./App.css";
import { GoSearch } from "react-icons/go";
import WeatherDetail from "./WeatherDetail";
import popularCities from "./popularCities";
import scatteredClouds from "./assets/images/scattered-clouds.jpg";
import thunderStorm from "./assets/images/thunderstorm.jpg";
import brokenClouds from "./assets/images/broken-clouds.jpg";
import overcastClouds from "./assets/images/overcast-clouds.jpg";
import clearSky from "./assets/images/clear-sky.jpg";
import haze from "./assets/images/haze.jpg";
import mist from "./assets/images/mist.jpg";
import lightRain from "./assets/images/light-rain.jpg";
import fewClouds from "./assets/images/few-clouds.jpg";

const App = () => {
    const [weather, setWeather] = useState({});
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(true);

    const [locationInput, setLocationInput] = useState("");
    const [imageSrc, setImageSrc] = useState("");

    const [popCities, setPopCities] = useState(popularCities);

    useEffect(() => {
        loadForecastData();
    }, []);

    
    useEffect(() => {
        const fetchPopCitiesTemp = () => {
            const newPopCities = [];

            popCities.forEach(async (city) => {
                try {
                    const { longitude, latitude } = await geocode(city.name);
                    const { temp } = await forecast(longitude, latitude);

                    newPopCities.push({ ...city, temp });
                } catch (error) {
                    setErrorMsg(error.message);

                    setLoading(false);

                    console.log(error.message);
                }
            });

            setPopCities(newPopCities);
        };

        fetchPopCitiesTemp();
    }, []);

    const loadForecastData = async (address = "Lagos") => {
        const { longitude, latitude, placeName } = await geocode(address);
        const {
            temp,
            clouds,
            humidity,
            pressure,
            timezone,
            description,
            wind_speed,
        } = await forecast(longitude, latitude);
        const { time } = await timeZone(longitude, latitude);

        setWeather({
            temp,
            placeName,
            clouds,
            humidity,
            wind_speed,
            pressure,
            timezone,
            longitude,
            latitude,
            description,
            time,
        });

        if (
            description === "thunderstorm" ||
            description === "thunderstorm with light rain"
        ) {
            setImageSrc(thunderStorm);
        } else if (description === "scattered clouds") {
            setImageSrc(scatteredClouds);
        } else if (description === "broken clouds") {
            setImageSrc(brokenClouds);
        } else if (description === "overcast clouds") {
            setImageSrc(overcastClouds);
        } else if (description === "clear sky") {
            setImageSrc(clearSky);
        } else if (description === "haze") {
            setImageSrc(haze);
        } else if (description === "mist") {
            setImageSrc(mist);
        } else if (
            description === "light rain" ||
            description === "moderate rain"
        ) {
            setImageSrc(lightRain);
        } else if (description === "few clouds") {
            setImageSrc(fewClouds);
        } else {
            setImageSrc("");
        }

        setLoading(false);
    };

    const geocode = async (address) => {
        const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            address
        )}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&limit=1`;

        try {
            const response = await fetch(geocodeUrl);
            const data = await response.json();

            if (data.features.length === 0 || data.message) {
                throw new Error("Unable to find location. Try another search!");
            }

            return {
                longitude: data.features[0].center[0],
                latitude: data.features[0].center[1],
                placeName: data.features[0].place_name,
            };
        } catch (error) {
            setErrorMsg(error.message);

            setLoading(false);

            console.log(error.message);

            return {};
        }
    };

    const forecast = async (longitude, latitude) => {
        console.log(import.meta.env.VITE_FORECAST_API_KEY);

        const forecastUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${encodeURIComponent(
            latitude
        )}&lon=${encodeURIComponent(longitude)}&units=metric&appid=${
            import.meta.env.VITE_FORECAST_API_KEY
        }`;

        try {
            const response = await fetch(forecastUrl);
            const data = await response.json();

            if (data.message) {
                throw new Error("Unable to fetch forecast data!");
            }

            const description = data.current.weather[0].description;
            const { timezone, lon, lat } = data;
            const { clouds, humidity, wind_speed, pressure, temp } =
                data.current;

            return {
                description,
                timezone,
                lon,
                lat,
                clouds,
                humidity,
                wind_speed,
                pressure,
                temp,
            };
        } catch (error) {
            setErrorMsg(error.message);

            setLoading(false);

            console.log(error.message);

            return {};
        }
    };

    const timeZone = async (longitude, latitude) => {
        const timezoneUrl = `http://api.timezonedb.com/v2.1/get-time-zone?key=${
            import.meta.env.VITE_TIMEZONE_API_KEY
        }format=json&by=position&lat=${latitude}&lng=${longitude}`;

        try {
            const response = await fetch(timezoneUrl);
            const data = await response.json();

            if (data.status === "FAILED" || data.message) {
                throw new Error("Unable to connect to timezone services!");
            }

            return { time: data.formatted };
        } catch (error) {
            setErrorMsg(error.message);

            setLoading(false);

            console.log(error.message);

            return {};
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        loadForecastData(locationInput);

        setLocationInput("");
    };

    const fetchPopCityForecast = (city) => {
        setLoading(true);

        loadForecastData(city);

        window.scrollTo(0, 0);
    };

    const {
        temp,
        placeName,
        clouds,
        pressure,
        wind_speed,
        humidity,
        timezone,
        longitude,
        latitude,
        description,
        time,
    } = weather;

    return (
        <>
            {loading && (
                <div className="overlay">
                    <h2>Loading...</h2>
                </div>
            )}

            <div
                className="app"
                style={{ backgroundImage: `url(${imageSrc})` }}
            >
                <main className="main-section">
                    <div className="app-header">
                        <h1>weather.app</h1>
                    </div>

                    <div>
                        <div className="weather-info">
                            <h2 className="degrees">
                                <span>{temp}</span> &#176;C
                            </h2>

                            <div className="location">
                                <h2 className="location-city">{placeName}</h2>
                                <p className="location-time">{time}</p>
                            </div>
                        </div>

                        {errorMsg && <h3 className="message">{errorMsg}</h3>}
                    </div>
                </main>

                <aside className="sidebar">
                    <form className="search-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Search city"
                            value={locationInput}
                            onChange={(e) => setLocationInput(e.target.value)}
                        />
                        <button type="submit" className="search-btn">
                            <GoSearch size={35} />
                        </button>
                    </form>

                    <div className="weather-details">
                        <h2 className="sidebar-sub-header">
                            Weather information for {placeName}
                        </h2>

                        <ul>
                            <WeatherDetail
                                label="Description"
                                value={description}
                            />
                            <WeatherDetail
                                label="Cloudy"
                                value={clouds && `${clouds}%`}
                            />
                            <WeatherDetail
                                label="Humidity"
                                value={humidity && `${humidity}%`}
                            />
                            <WeatherDetail
                                label="Wind Speed"
                                value={wind_speed && `${wind_speed}km/hr`}
                            />
                            <WeatherDetail
                                label="Pressure"
                                value={pressure && `${pressure}Pa`}
                            />
                            <WeatherDetail label="Time Zone" value={timezone} />
                            <WeatherDetail
                                label="Longitude"
                                value={longitude}
                            />
                            <WeatherDetail label="Latitude" value={latitude} />
                        </ul>
                    </div>

                    <div className="popular-locations">
                        <h2 className="sidebar-sub-header">Popular Cities</h2>
                        <ul className="popular-locations-items">
                            {popCities.map((city, index) => (
                                <li
                                    key={index}
                                    onClick={() =>
                                        fetchPopCityForecast(city.name)
                                    }
                                >
                                    <h3>{city.name}</h3>
                                    <span className="city-temp">
                                        {city.temp} &#176;C
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
            </div>
        </>
    );
};

export default App;
