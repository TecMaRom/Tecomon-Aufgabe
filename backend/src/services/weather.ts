import axios from "axios";

export interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  cachedAt: Date;
}

interface GeocodingResponse {
  results: Array<{
    latitude: number;
    longitude: number;
    name: string;
  }>;
}

interface WeatherResponse {
  current: {
    temperature_2m: number;
    weather_code: number;
  };
}

class WeatherService {
  private baseURL = "https://api.open-meteo.com/v1";

  async getWeatherData(location: string): Promise<WeatherData> {
    try {
      const geoResponse = await axios.get<GeocodingResponse>(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          location
        )}&count=1`
      );

      if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
        throw new Error(`Location "${location}" not found`);
      }

      const firstResult = geoResponse.data.results[0];
      if (!firstResult) {
        throw new Error(`Location "${location}" not found`);
      }

      const { latitude, longitude, name } = firstResult;

      const weatherResponse = await axios.get<WeatherResponse>(
        `${this.baseURL}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
      );

      const current = weatherResponse.data.current;
      const temperature = Math.round(current.temperature_2m);
      const description = this.getWeatherDescription(current.weather_code);

      const weatherData: WeatherData = {
        location: name,
        temperature,
        description,
        cachedAt: new Date(),
      };

      return weatherData;
    } catch (error) {
      console.error("Weather API error:", error);
      throw new Error(`Failed to fetch weather data for ${location}`);
    }
  }

  private getWeatherDescription(weatherCode: number): string {
    const weatherCodes: { [key: number]: string } = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Depositing rime fog",
      51: "Light drizzle",
      61: "Slight rain",
      71: "Slight snow",
      95: "Thunderstorm",
    };

    return weatherCodes[weatherCode] || "Unknown";
  }
}

export default new WeatherService();
