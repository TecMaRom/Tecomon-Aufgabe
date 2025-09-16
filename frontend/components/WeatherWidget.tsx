"use client";
import { useState } from "react";
import { deleteWidget } from "@/utils/api";
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

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <h4 className={styles.title}>{location}</h4>
        <button
          className={styles.deleteButton}
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting widget..." : "Delete"}
        </button>
      </div>

      <div className={styles.content}>
        <p>Loading weather data...</p>
      </div>
    </div>
  );
}
