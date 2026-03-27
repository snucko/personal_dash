import type { WeatherData } from '../types';

interface GeoLocation {
  latitude: number;
  longitude: number;
  city?: string;
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    weather_code: number;
    is_day: number;
  };
  timezone: string;
}

interface ReverseGeocodeResponse {
  results?: Array<{
    name: string;
    admin1?: string;
  }>;
}

// WMO Weather Interpretation Codes
const getWeatherCondition = (code: number): string => {
  if (code === 0) return 'Clear';
  if (code === 1 || code === 2) return 'Mostly Clear';
  if (code === 3) return 'Overcast';
  if ([45, 48].includes(code)) return 'Foggy';
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'Rainy';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snowy';
  if ([80, 81, 82].includes(code)) return 'Rainy';
  if ([85, 86].includes(code)) return 'Snow Showers';
  if ([95, 96, 99].includes(code)) return 'Thunderstorm';
  return 'Unknown';
};

export const getUserLocation = (): Promise<GeoLocation> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      // Fallback if geolocation not available
      console.warn('Geolocation not supported, using fallback');
      resolve({ latitude: 41.6726, longitude: -71.2824, city: 'Bristol, RI' });
      return;
    }

    // Set a timeout for geolocation request (user might deny permission)
    const timeout = setTimeout(() => {
      console.warn('Geolocation timeout, using fallback');
      resolve({ latitude: 41.6726, longitude: -71.2824, city: 'Bristol, RI' });
    }, 5000);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        clearTimeout(timeout);
        const { latitude, longitude } = position.coords;
        
        // Try to get city name via reverse geocoding
        try {
          const cityName = await reverseGeocode(latitude, longitude);
          resolve({ latitude, longitude, city: cityName });
        } catch (err) {
          // If reverse geocoding fails, just return coords
          console.warn('Reverse geocoding failed:', err);
          resolve({ latitude, longitude, city: 'Current Location' });
        }
      },
      (error) => {
        clearTimeout(timeout);
        // Fallback: Bristol, RI coordinates
        console.warn('Geolocation permission denied or error:', error.message);
        resolve({ latitude: 41.6726, longitude: -71.2824, city: 'Bristol, RI' });
      },
      { timeout: 5000 }
    );
  });
};

const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
  try {
    // Use Nominatim (OpenStreetMap) for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          'Accept-Language': 'en'
        }
      }
    );
    
    if (!response.ok) {
      return 'Current Location';
    }
    
    const data: any = await response.json();
    
    if (!data.address) {
      return 'Current Location';
    }
    
    // Prefer city > town > county > state
    const city = data.address.city || data.address.town || data.address.county;
    const state = data.address.state_code;
    
    if (city && state) {
      return `${city}, ${state.toUpperCase()}`;
    }
    
    return city || 'Current Location';
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return 'Current Location';
  }
};

export const getWeather = async (location: GeoLocation): Promise<WeatherData> => {
  const { latitude, longitude, city } = location;
  
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day&timezone=auto`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  
  const data: OpenMeteoResponse = await response.json();
  const current = data.current;
  const temp = Math.round(current.temperature_2m * 9/5 + 32); // Convert C to F
  const condition = getWeatherCondition(current.weather_code);
  const location_str = city || 'Current Location';
  
  return {
    temperature: temp,
    condition,
    description: '',
    location: location_str
  };
};

export const fetchWeatherData = async (): Promise<WeatherData> => {
  const location = await getUserLocation();
  return getWeather(location);
};
