"use client";

import WidgetForm from "@/components/WidgetForm";
import WidgetGrid from "@/components/WidgetGrid";

const sampleWidgets = [
  { _id: "1", location: "Berlin", createdAt: "2024-01-01T00:00:00.000Z" },
  { _id: "2", location: "Paris", createdAt: "2024-01-01T00:00:00.000Z" },
];

export default function Dashboard() {
  return (
    <main>
      <div className="header">
        <h1>Weather Widgets Dashboard</h1>
        <p className="subtitle">Frontend dashboard for weather widgets</p>
      </div>

      <WidgetForm />

      <div>
        <h2>Your Weather Widgets</h2>
        <WidgetGrid widgets={sampleWidgets} />
      </div>
    </main>
  );
}
