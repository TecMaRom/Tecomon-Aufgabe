import { WeatherData } from "../services/weather";

interface CacheEntry {
  data: WeatherData;
  timestamp: number;
}

class WeatherCache {
  private cache = new Map<string, CacheEntry>();
  private TTL = 5 * 60 * 1000;

  get(location: string): WeatherData | null {
    const normalizedLocation = location.toLowerCase().trim();
    const cached = this.cache.get(normalizedLocation);

    if (!cached) {
      return null;
    }

    const isExpired = Date.now() - cached.timestamp > this.TTL;

    if (isExpired) {
      this.cache.delete(normalizedLocation);
      return null;
    }

    return cached.data;
  }

  set(location: string, weatherData: WeatherData): void {
    const normalizedLocation = location.toLowerCase().trim();

    this.cache.set(normalizedLocation, {
      data: weatherData,
      timestamp: Date.now(),
    });
  }
}

export default new WeatherCache();
