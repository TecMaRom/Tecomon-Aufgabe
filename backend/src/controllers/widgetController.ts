import { Request, Response } from "express";
import Widget from "../models/Widget";
import { Types } from "mongoose";
import weatherService from "../services/weather";

export const getAllWidgets = async (req: Request, res: Response) => {
  try {
    const widgets = await Widget.find().sort({ createdAt: -1 });
    res.json(widgets);
  } catch (error) {
    console.error("Error fetching widgets:", error);
    res.status(500).json({ error: "Failed to fetch widgets" });
  }
};

export const createWidget = async (req: Request, res: Response) => {
  try {
    const { location } = req.body;

    if (!location) {
      return res.status(400).json({ error: "Location is required" });
    }

    const widget = new Widget({ location: location.trim() });
    const savedWidget = await widget.save();

    res.status(201).json(savedWidget);
  } catch (error) {
    console.error("Error creating widget:", error);
    res.status(500).json({ error: "Failed to create widget" });
  }
};

export const deleteWidget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid widget ID" });
    }

    const deletedWidget = await Widget.findByIdAndDelete(id);

    if (!deletedWidget) {
      return res.status(404).json({ error: "Widget not found" });
    }

    res.json({ message: "Widget deleted successfully" });
  } catch (error) {
    console.error("Error deleting widget:", error);
    res.status(500).json({ error: "Failed to delete widget" });
  }
};

export const getWidgetWeather = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid widget ID" });
    }

    const widget = await Widget.findById(id);

    if (!widget) {
      return res.status(404).json({ error: "Widget not found" });
    }

    const weatherData = await weatherService.getWeatherData(widget.location);
    res.json(weatherData);
  } catch (error) {
    console.error("Error fetching weather:", error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
};
