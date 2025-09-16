"use client";
import { useState } from "react";
import { createWidget } from "@/utils/api";
import { Widget } from "@/utils/types";
import styles from "./WidgetForm.module.css";

interface WidgetFormProps {
  onWidgetCreated: (widget: Widget) => void;
  onWidgetRefreshed?: (location: string) => void;
}

export default function WidgetForm({
  onWidgetCreated,
  onWidgetRefreshed,
}: WidgetFormProps) {
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isRefreshMessage =
    error?.toLowerCase().includes("weather refreshed") ?? false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedLocation = location.trim();
    if (!trimmedLocation) {
      setError("Please enter a location");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newWidget = await createWidget({ location: trimmedLocation });
      onWidgetCreated(newWidget);
      setLocation("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create widget";

      if (
        onWidgetRefreshed &&
        message.toLowerCase().includes("weather refreshed")
      ) {
        onWidgetRefreshed(trimmedLocation);
      }

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Add Weather Widget</h3>
      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="location" className={styles.label}>
            Location:
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter city name (e.g., Berlin)"
            className={styles.input}
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div className={isRefreshMessage ? styles.success : styles.error}>
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className={
                isRefreshMessage ? styles.successClose : styles.errorClose
              }
            >
              ×
            </button>
          </div>
        )}

        <button type="submit" className={styles.button} disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Widget"}
        </button>
      </form>
    </div>
  );
}
