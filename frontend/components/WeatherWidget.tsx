"use client";
import { useState, useEffect } from "react";
import { deleteWidget, getWeatherData } from "@/utils/api";
import { WeatherData } from "@/utils/types";
import styles from "./WeatherWidget.module.css";

interface WeatherWidgetProps {
  id: string;
  location: string;
  onWidgetDeleted: (id: string) => void;
}

export default function WeatherWidget({
  id,
  location,
  onWidgetDeleted,
}: WeatherWidgetProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setIsLoadingWeather(true);
        setWeatherError(null);
        const data = await getWeatherData(id);
        setWeatherData(data);
      } catch (error) {
        setWeatherError(
          error instanceof Error ? error.message : "Failed to load weather data"
        );
      } finally {
        setIsLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [id]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the ${location} widget?`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      await deleteWidget(id);
      onWidgetDeleted(id);
    } catch (error) {
      console.error("Error deleting widget:", error);
      alert("Failed to delete widget. Please try again.");
      setIsDeleting(false);
    }
  };

  const formatLastUpdated = (cachedAt: string) => {
    const now = new Date();
    const cached = new Date(cachedAt);
    const diffMinutes = Math.floor(
      (now.getTime() - cached.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 1) return "just now";
    if (diffMinutes === 1) return "1 minute ago";
    return `${diffMinutes} minutes ago`;
  };

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <h4 className={styles.title}>{location}</h4>
        <button
          className={styles.deleteButton}
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      <div className={styles.content}>
        {isLoadingWeather && (
          <div className={styles.loading}>
            <p>Loading weather data...</p>
          </div>
        )}

        {weatherError && (
          <div className={styles.error}>
            <p>⚠️ {weatherError}</p>
          </div>
        )}

        {weatherData && !isLoadingWeather && (
          <div className={styles.weatherInfo}>
            <div className={styles.temperature}>
              {weatherData.temperature}°C
            </div>
            <div className={styles.description}>{weatherData.description}</div>
            <div className={styles.lastUpdated}>
              Last updated: {formatLastUpdated(weatherData.cachedAt)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
