"use client";
import WeatherWidget from "./WeatherWidget";
import { Widget } from "@/utils/types";
import styles from "./WidgetGrid.module.css";

interface WidgetGridProps {
  widgets: Widget[];
  onWidgetDeleted: (id: string) => void;
}

export default function WidgetGrid({
  widgets,
  onWidgetDeleted,
}: WidgetGridProps) {
  if (widgets.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No widgets yet. Add your first weather widget above!</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {widgets.map((widget) => (
        <WeatherWidget
          key={widget._id}
          id={widget._id}
          location={widget.location}
          onWidgetDeleted={onWidgetDeleted}
        />
      ))}
    </div>
  );
}
