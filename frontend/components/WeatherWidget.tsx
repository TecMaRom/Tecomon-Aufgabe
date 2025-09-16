"use client";
import styles from "./WeatherWidget.module.css";

interface WeatherWidgetProps {
  id: string;
  location: string;
}

export default function WeatherWidget({ id, location }: WeatherWidgetProps) {
  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <h4 className={styles.title}>{location}</h4>
        <button className={styles.deleteButton}>Delete</button>
      </div>

      <div className={styles.content}>
        <p>Loading weather data...</p>
      </div>
    </div>
  );
}
