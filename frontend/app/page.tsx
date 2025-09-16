"use client";
import { useState, useEffect } from "react";
import WidgetForm from "@/components/WidgetForm";
import WidgetGrid from "@/components/WidgetGrid";
import { Widget } from "@/utils/types";
import { getWidgets } from "@/utils/api";

export default function Dashboard() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTokens, setRefreshTokens] = useState<Record<string, number>>(
    {}
  );

  useEffect(() => {
    const loadWidgets = async () => {
      try {
        setIsLoading(true);
        const fetchedWidgets = await getWidgets();
        setWidgets(fetchedWidgets);
      } catch (error) {
        console.error("Error loading widgets:", error);
        setError("Failed to load widgets");
      } finally {
        setIsLoading(false);
      }
    };

    loadWidgets();
  }, []);

  const handleWidgetCreated = (newWidget: Widget) => {
    setWidgets((prevWidgets) => [newWidget, ...prevWidgets]);
  };

  const handleWidgetDeleted = (deletedId: string) => {
    setWidgets((prevWidgets) =>
      prevWidgets.filter((widget) => widget._id !== deletedId)
    );
    setRefreshTokens((prev) => {
      const updated = { ...prev };
      delete updated[deletedId];
      return updated;
    });
  };

  const handleWidgetRefreshed = (location: string) => {
    const match = widgets.find(
      (widget) => widget.location.toLowerCase() === location.toLowerCase()
    );

    if (!match) {
      return;
    }

    setRefreshTokens((prev) => ({
      ...prev,
      [match._id]: (prev[match._id] || 0) + 1,
    }));
  };

  if (isLoading) {
    return (
      <main>
        <div className="header">
          <h1>Weather Widgets Dashboard</h1>
          <p className="subtitle">Loading...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <div className="header">
          <h1>Weather Widgets Dashboard</h1>
          <p className="subtitle">Error: {error}</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="header">
        <h1>Weather Widgets Dashboard</h1>
        <p className="subtitle">Frontend dashboard for weather widgets</p>
      </div>

      <WidgetForm
        onWidgetCreated={handleWidgetCreated}
        onWidgetRefreshed={handleWidgetRefreshed}
      />

      <div>
        <h2>Your Weather Widgets</h2>
        <WidgetGrid
          widgets={widgets}
          onWidgetDeleted={handleWidgetDeleted}
          refreshTokens={refreshTokens}
        />
      </div>
    </main>
  );
}
