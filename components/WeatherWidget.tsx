import React, { useState, useEffect } from 'react';
import type { WeatherData } from '../types';
import WidgetCard from './WidgetCard';
import { ICONS } from '../constants';
import { fetchWeatherData } from '../services/weatherService';

const WeatherIcon: React.FC<{ condition: string }> = ({ condition }) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) return ICONS.sun;
    if (lowerCondition.includes('cloud') || lowerCondition.includes('mostly')) return ICONS.cloud;
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) return ICONS.rain;
    if (lowerCondition.includes('snow') || lowerCondition.includes('flurries')) return ICONS.snow;
    if (lowerCondition.includes('storm') || lowerCondition.includes('thunder')) return ICONS.storm;
    if (lowerCondition.includes('fog')) return ICONS.cloud;
    return ICONS.cloud;
};

const LoadingSkeleton: React.FC = () => (
    <div className="flex flex-col items-center justify-center animate-pulse">
        <div className="w-16 h-16 bg-slate-700 rounded-full mb-4"></div>
        <div className="h-10 w-24 bg-slate-700 rounded-md mb-2"></div>
        <div className="h-6 w-40 bg-slate-700 rounded-md"></div>
    </div>
);

const ErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
    <div className="text-center">
        <p className="text-sm text-red-400 mb-3">Failed to load weather</p>
        <button
            onClick={onRetry}
            className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded transition-colors"
        >
            Retry
        </button>
    </div>
);

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData();
      setWeather(data);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load weather');
      // Fallback to last known weather or null
      setWeather(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(loadWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <WidgetCard title={weather?.location || "Weather"} icon={ICONS.weather}>
      <div className="flex-grow flex flex-col items-center justify-center">
        {isLoading ? (
            <LoadingSkeleton />
        ) : error ? (
            <ErrorState onRetry={loadWeather} />
        ) : weather ? (
          <div className="text-center w-full">
            <div className="flex justify-center mb-2">
                <WeatherIcon condition={weather.condition} />
            </div>
            <p className="text-5xl font-bold text-white">{weather.temperature}&deg;F</p>
            <p className="text-lg text-slate-300 capitalize">{weather.condition}</p>
            <p className="text-sm text-slate-400 mt-1">{weather.location}</p>
          </div>
        ) : (
            <p className="text-slate-400 text-sm">No data available</p>
        )}
      </div>
    </WidgetCard>
  );
};

export default WeatherWidget;