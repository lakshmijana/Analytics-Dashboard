


"use client";

import React, { useEffect, useState, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";

// Types
type WeatherData = {
  main: { temp: number; humidity: number; feels_like: number; pressure: number };
  wind: { speed: number; deg: number };
  weather: { description: string; icon: string; main: string }[];
  name: string;
  sys: { country: string };
  coord: { lat: number; lon: number };
  dt: number;
};

type ForecastItem = {
  dt: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: { description: string; icon: string; main: string }[];
  wind: { speed: number };
  pop?: number; // probability of precipitation (might not be available in free API)
  dt_txt: string;
};

type ForecastData = {
  list: ForecastItem[];
  city: {
    name: string;
    country: string;
    coord: { lat: number; lon: number };
  };
};

type CitySuggestion = {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  countryCode: string;
};

// API keys - in a real application, you would use environment variables with Next.js config
// For demo purposes only - replace with your actual API keys
const OPENWEATHER_API_KEY = "e902884bb744e3034b5b8c9d6c97ba9d";
const GEODB_API_KEY = "d00b35d961msh2c22e0b9475dea0p10109ejsna38317da7dc3";

const WeatherWidget = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [processedForecastData, setProcessedForecastData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [geoLocationError, setGeoLocationError] = useState<string | null>(null);

  // Current location coordinates
  const [location, setLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({
    latitude: null,
    longitude: null,
  });

  // Process forecast data into chart-friendly format
  const processForecastData = useCallback((data: ForecastData) => {
    if (!data || !data.list || !Array.isArray(data.list)) return null;
    
    // Group forecast by day
    const dailyData: { [key: string]: any } = {};
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString(undefined, { weekday: 'short' });
      
      if (!dailyData[day]) {
        dailyData[day] = {
          temps: [],
          humidity: [],
          wind: [],
          precipitation: [],
          date: day,
          dt: item.dt
        };
      }
      
      dailyData[day].temps.push(item.main.temp);
      dailyData[day].humidity.push(item.main.humidity);
      dailyData[day].wind.push(item.wind.speed);
      dailyData[day].precipitation.push(item.pop || 0);
    });
    
    // Calculate min/max/avg values for each day
    const processedData = Object.values(dailyData).map((day: any) => {
      return {
        date: day.date,
        dt: day.dt,
        max: Math.round(Math.max(...day.temps)),
        min: Math.round(Math.min(...day.temps)),
        avg: Math.round(day.temps.reduce((a: number, b: number) => a + b, 0) / day.temps.length),
        humidity: Math.round(day.humidity.reduce((a: number, b: number) => a + b, 0) / day.humidity.length),
        wind: Math.round((day.wind.reduce((a: number, b: number) => a + b, 0) / day.wind.length) * 10) / 10,
        precipitation: Math.round((day.precipitation.reduce((a: number, b: number) => a + b, 0) / day.precipitation.length) * 100)
      };
    });
    
    // Sort by date and limit to 7 days
    const sortedData = processedData.sort((a: any, b: any) => a.dt - b.dt).slice(0, 7);
    
    return {
      tempChartData: sortedData,
      humidityChartData: sortedData,
      windChartData: sortedData,
      dailyData: sortedData
    };
  }, []);

  // Fetch weather data from OpenWeatherMap API directly (frontend only)
  const fetchWeatherData = useCallback(async (lat: number, lon: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Current weather data
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
      );
      
      if (!weatherResponse.ok) {
        const errorData = await weatherResponse.json();
        console.error("Weather API error:", errorData);
        throw new Error(`Weather API error: ${weatherResponse.status} - ${errorData.message || 'Unknown error'}`);
      }
      
      const weatherData = await weatherResponse.json();
      setWeatherData(weatherData);
      
      // Using 5-day forecast instead of One Call API (which requires subscription)
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
      );
      
      if (!forecastResponse.ok) {
        const errorData = await forecastResponse.json();
        console.error("Forecast API error:", errorData);
        throw new Error(`Forecast API error: ${forecastResponse.status} - ${errorData.message || 'Unknown error'}`);
      }
      
      const forecastData = await forecastResponse.json();
      setForecastData(forecastData);
      
      // Process forecast data for charts
      const processed = processForecastData(forecastData);
      setProcessedForecastData(processed);
      
    } catch (err: any) {
      console.error("Failed to fetch weather data:", err);
      
      // More descriptive error message
      if (err.message.includes('401')) {
        setError("Authentication failed. Please check your API key.");
      } else if (err.message.includes('429')) {
        setError("Too many requests. Please try again later.");
      } else if (err.message.includes('404')) {
        setError("Location not found. Please try a different location.");
      } else {
        setError(`Failed to fetch weather data: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [processForecastData]);

  // Fetch city suggestions from GeoDB Cities API directly
  const fetchCitySuggestions = async (query: string) => {
    if (query.length < 3) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(query)}&limit=5&sort=-population`,
        {
          headers: {
            "X-RapidAPI-Key": GEODB_API_KEY,
            "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com"
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`GeoDB API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if data.data exists
      if (!data.data || !Array.isArray(data.data)) {
        console.error("Unexpected GeoDB API response:", data);
        throw new Error("Invalid response from city search API");
      }
      
      const suggestions: CitySuggestion[] = data.data.map((city: any) => ({
        name: city.name,
        latitude: city.latitude,
        longitude: city.longitude,
        country: city.country,
        countryCode: city.countryCode
      }));
      
      setCitySuggestions(suggestions);
    } catch (err: any) {
      console.error("Failed to fetch city suggestions:", err);
      setError(`Failed to fetch city suggestions: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current location using browser geolocation
  const getLocation = useCallback(() => {
    setGeoLocationError(null);
    
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setGeoLocationError(
            `Unable to get your location: ${error.message}. Please search for a city or try again.`
          );
          setIsLoading(false);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setGeoLocationError("Geolocation is not supported by your browser.");
    }
  }, []);

  // Handle city search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Debounce API calls
    const timeoutId = setTimeout(() => {
      if (value.length >= 3) {
        fetchCitySuggestions(value);
      } else {
        setCitySuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  // Handle selecting a city from suggestions
  const handleCitySelect = (city: CitySuggestion) => {
    setSearchQuery(`${city.name}, ${city.countryCode}`);
    setCitySuggestions([]);
    if (city.latitude && city.longitude) {
      fetchWeatherData(city.latitude, city.longitude);
    }
  };

  // Handle using current location button click
  const handleUseMyLocation = () => {
    getLocation();
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (citySuggestions.length > 0) {
      handleCitySelect(citySuggestions[0]);
    }
  };

  // Initial effect to load weather based on geolocation
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  // Effect to fetch weather when location changes
  useEffect(() => {
    if (location.latitude !== null && location.longitude !== null) {
      fetchWeatherData(location.latitude, location.longitude);
    }
  }, [location, fetchWeatherData]);

  // Format temperature for display
  const formatTemp = (temp: number) => {
    return Math.round(temp);
  };

  // Get weather icon URL from icon code
  const getWeatherIconUrl = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  // Get wind direction from degrees
  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long', 
      day: 'numeric'
    });
  };

  // Get custom tooltip for temperature chart
  const CustomTempTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow">
          <p className="font-semibold">{label}</p>
          <p className="text-red-500">Max: {payload[0].value}°C</p>
          <p className="text-blue-500">Min: {payload[1].value}°C</p>
          <p className="text-purple-500">Avg: {payload[2].value}°C</p>
        </div>
      );
    }
    return null;
  };

  // Add a fallback function to handle potentially missing data
  const safelyRenderForecast = (data: any) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }
    return data;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Weather Forecast</h2>

      <div className="relative mb-6">
        <form onSubmit={handleSearchSubmit} className="flex items-center">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search for a city..."
              className="w-full p-3 border border-gray-300 rounded-l-lg outline-none"
              aria-label="Search for a city"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <button 
            type="button"
            onClick={handleUseMyLocation}
            className="bg-blue-500 text-white p-3 rounded-r-lg hover:bg-blue-600 transition flex items-center justify-center"
            aria-label="Use my location"
          >
            📍
          </button>
        </form>

        {citySuggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-auto">
            {citySuggestions.map((city, id) => (
              <li
                key={id}
                onClick={() => handleCitySelect(city)}
                className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                tabIndex={0}
                role="option"
              >
                {city.name}, {city.countryCode}
              </li>
            ))}
          </ul>
        )}
      </div>

      {geoLocationError && (
        <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg mb-4">
          {geoLocationError}
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      )}

      {weatherData && !isLoading && (
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h3 className="text-xl font-bold">{weatherData.name}, {weatherData.sys.country}</h3>
              <p className="text-gray-600">{formatDate(weatherData.dt)}</p>
            </div>
            <div className="mt-2 md:mt-0 text-3xl font-bold">
              {formatTemp(weatherData.main.temp)}°C
            </div>
          </div>
          
          <div className="flex items-center mb-4">
            <img 
              src={getWeatherIconUrl(weatherData.weather[0].icon)} 
              alt={weatherData.weather[0].description}
              className="w-16 h-16"
            />
            <div className="ml-2">
              <p className="capitalize text-lg">{weatherData.weather[0].description}</p>
              <p className="text-gray-600">Feels like: {formatTemp(weatherData.main.feels_like)}°C</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-600">Humidity</p>
              <p className="text-lg font-semibold">{weatherData.main.humidity}%</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-600">Wind</p>
              <p className="text-lg font-semibold">
                {weatherData.wind.speed} m/s {getWindDirection(weatherData.wind.deg)}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-600">Pressure</p>
              <p className="text-lg font-semibold">{weatherData.main.pressure} hPa</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-600">Coordinates</p>
              <p className="text-lg font-semibold">
                {weatherData.coord.lat.toFixed(2)}, {weatherData.coord.lon.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Forecast Display */}
      {processedForecastData && processedForecastData.tempChartData && !isLoading && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Temperature Forecast</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={processedForecastData.tempChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#718096"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#718096"
                unit="°C"
              />
              <Tooltip content={<CustomTempTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="max" 
                stroke="#f56565" 
                strokeWidth={2}
                dot={{ stroke: '#f56565', strokeWidth: 2, r: 4 }}
                activeDot={{ stroke: '#f56565', strokeWidth: 2, r: 6 }}
                name="Max Temp"
              />
              <Line 
                type="monotone" 
                dataKey="min" 
                stroke="#3182ce" 
                strokeWidth={2}
                dot={{ stroke: '#3182ce', strokeWidth: 2, r: 4 }}
                activeDot={{ stroke: '#3182ce', strokeWidth: 2, r: 6 }}
                name="Min Temp"
              />
              <Line 
                type="monotone" 
                dataKey="avg" 
                stroke="#805ad5" 
                strokeWidth={2}
                dot={{ stroke: '#805ad5', strokeWidth: 2, r: 4 }}
                activeDot={{ stroke: '#805ad5', strokeWidth: 2, r: 6 }}
                name="Avg Temp"
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-7 gap-2 mt-4">
            {safelyRenderForecast(processedForecastData.dailyData)?.map((day: any, index: number) => (
              <div key={index} className="text-center">
                <p className="text-xs text-gray-600">
                  {day.date}
                </p>
                <div className="h-10 flex items-center justify-center">
                  {forecastData && forecastData.list && forecastData.list[index] && (
                    <img 
                      src={getWeatherIconUrl(forecastData.list[index].weather[0].icon)} 
                      alt={forecastData.list[index].weather[0].description || "weather"}
                      className="w-10 h-10 mx-auto"
                    />
                  )}
                </div>
                <p className="text-sm">
                  <span className="text-red-500 font-semibold">{day.max}°</span> / 
                  <span className="text-blue-500">{day.min}°</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Humidity and Precipitation Chart */}
      {processedForecastData && processedForecastData.humidityChartData && !isLoading && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Humidity & Precipitation Chance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={processedForecastData.humidityChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" stroke="#3182ce" unit="%" />
              <YAxis yAxisId="right" orientation="right" stroke="#48bb78" unit="%" />
              <Tooltip />
              <Legend />
              <Bar 
                yAxisId="left" 
                dataKey="humidity" 
                fill="#3182ce" 
                name="Humidity" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                yAxisId="right" 
                dataKey="precipitation" 
                fill="#48bb78" 
                name="Precipitation Chance" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Wind Speed Chart */}
      {processedForecastData && processedForecastData.windChartData && !isLoading && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Wind Speed Forecast</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={processedForecastData.windChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" />
              <YAxis unit=" m/s" />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="wind" 
                stroke="#ed8936" 
                fillOpacity={0.3}
                fill="#ed8936" 
                name="Wind Speed" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {!weatherData && !isLoading && !error && (
        <div className="text-center py-12 text-gray-500">
          <p>Search for a city or use your current location to see weather data</p>
        </div>
      )}

      <div className="mt-8 text-xs text-gray-500 text-center">
        <p>Powered by OpenWeatherMap API</p>
      </div>
    </div>
  );
};

export default WeatherWidget;