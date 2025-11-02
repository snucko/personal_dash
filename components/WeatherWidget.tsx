
import React, { useState, useEffect } from 'react';
import { getWeatherData } from '../services/geminiService';
import type { WeatherData } from '../types';
import WidgetCard from './WidgetCard';
import { ICONS } from '../constants';

const WeatherIcon: React.FC<{ condition: string }> = ({ condition }) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) return ICONS.sun;
    if (lowerCondition.includes('cloud')) return ICONS.cloud;
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) return ICONS.rain;
    if (lowerCondition.includes('snow') || lowerCondition.includes('flurries')) return ICONS.snow;
    if (lowerCondition.includes('storm') || lowerCondition.includes('thunder')) return ICONS.storm;
    return ICONS.cloud;
};

const LoadingSkeleton: React.FC = () => (
    <div className="flex flex-col items-center justify-center animate-pulse">
        <div className="w-16 h-16 bg-slate-700 rounded-full mb-4"></div>
        <div className="h-10 w-24 bg-slate-700 rounded-md mb-2"></div>
        <div className="h-6 w-40 bg-slate-700 rounded-md"></div>
    </div>
);

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setError(null);
        setLoading(true);
        const data = await getWeatherData();
        setWeather(data);
      } catch (err) {
        setError("Could not fetch weather data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  return (
    <WidgetCard title={weather?.location || "Weather"} icon={ICONS.weather}>
      <div className="flex-grow flex items-center justify-center">
        {loading ? (
            <LoadingSkeleton />
        ) : error ? (
          <p className="text-center text-red-400">{error}</p>
        ) : weather && (
          <div className="text-center">
            <div className="flex justify-center mb-2">
                <WeatherIcon condition={weather.condition} />
            </div>
            <p className="text-5xl font-bold text-white">{weather.temperature}&deg;F</p>
            <p className="text-lg text-slate-300 capitalize">{weather.condition}</p>
            <p className="text-sm text-slate-400 mt-1">{weather.description}</p>
          </div>
        )}
      </div>
    </WidgetCard>
  );
};

export default WeatherWidget;