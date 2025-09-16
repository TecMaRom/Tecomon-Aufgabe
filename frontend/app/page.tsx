"use client";
import { useState } from "react";
import WidgetForm from "@/components/WidgetForm";
import WidgetGrid from "@/components/WidgetGrid";
import { Widget } from "@/utils/types";

export default function Dashboard() {
  const [widgets, setWidgets] = useState<Widget[]>([
    { _id: "1", location: "Berlin", createdAt: "2024-01-01T00:00:00.000Z" },
    { _id: "2", location: "Paris", createdAt: "2024-01-01T00:00:00.000Z" },
  ]);

  const handleWidgetCreated = (newWidget: Widget) => {
    setWidgets((prevWidgets) => [newWidget, ...prevWidgets]);
  };

  return (
    <main>
      <div className="header">
        <h1>Weather Widgets Dashboard</h1>
        <p className="subtitle">Frontend dashboard for weather widgets</p>
      </div>

      <WidgetForm onWidgetCreated={handleWidgetCreated} />

      <div>
        <h2>Your Weather Widgets</h2>
        <WidgetGrid widgets={widgets} />
      </div>
    </main>
  );
}
