import weatherService from "../../services/weather";
import weatherCache from "../../cache/weatherCache";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock("../../cache/weatherCache");
const mockedCache = weatherCache as jest.Mocked<typeof weatherCache>;

describe("WeatherService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return cached data when available", async () => {
    const cachedData = {
      location: "Berlin",
      temperature: 22,
      description: "Clear sky",
      cachedAt: new Date(),
    };

    mockedCache.get.mockReturnValue(cachedData);

    const result = await weatherService.getWeatherData("Berlin");

    expect(result).toEqual(cachedData);
    expect(mockedCache.get).toHaveBeenCalledWith("Berlin");
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it("should fetch from API when cache miss", async () => {
    mockedCache.get.mockReturnValue(null);

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        results: [{ latitude: 52.52, longitude: 13.41, name: "Berlin" }],
      },
    } as any);

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        current: {
          temperature_2m: 23,
          weather_code: 0,
        },
      },
    } as any);

    const result = await weatherService.getWeatherData("Berlin");

    expect(result.location).toBe("Berlin");
    expect(result.temperature).toBe(23);
    expect(result.description).toBe("Clear sky");
    expect(mockedCache.set).toHaveBeenCalled();
  });

  it("should throw error for invalid location", async () => {
    mockedCache.get.mockReturnValue(null);

    mockedAxios.get.mockResolvedValueOnce({
      data: { results: [] },
    } as any);

    await expect(
      weatherService.getWeatherData("InvalidLocation")
    ).rejects.toThrow("Failed to fetch weather data for InvalidLocation");
  });
});
