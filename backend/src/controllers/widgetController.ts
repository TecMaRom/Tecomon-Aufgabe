import { Request, Response } from "express";
import Widget from "../models/Widget";
import { Types } from "mongoose";
import weatherService from "../services/weather";
import weatherCache from "../cache/weatherCache";
import { validateLocation, createErrorResponse } from "../utils/validation";

export const getAllWidgets = async (req: Request, res: Response) => {
  try {
    const widgets = await Widget.find().sort({ createdAt: -1 });
    res.json(widgets);
  } catch (error) {
    console.error("Error fetching widgets:", error);
    res.status(500).json(createErrorResponse("Failed to fetch widgets", 500));
  }
};

export const createWidget = async (req: Request, res: Response) => {
  try {
    const { location } = req.body;

    const validationError = validateLocation(location);
    if (validationError) {
      return res.status(400).json(createErrorResponse(validationError, 400));
    }

    const normalizedLocation = location.trim();
    const locationKey = normalizedLocation.toLowerCase();

    const existingWidget = await Widget.findOne({ locationKey });

    if (existingWidget) {
      const cachedWeather = weatherCache.get(existingWidget.location);

      if (cachedWeather) {
        return res
          .status(409)
          .json(createErrorResponse("Widget already exists", 409));
      }

      try {
        await weatherService.getWeatherData(existingWidget.location);
      } catch (error) {
        console.error("Error refreshing weather:", error);
        return res
          .status(500)
          .json(createErrorResponse("Failed to refresh weather data", 500));
      }

      return res.status(409).json(
        createErrorResponse("Widget already exists; weather refreshed", 409)
      );
    }

    const cachedWeather = weatherCache.get(normalizedLocation);

    if (!cachedWeather) {
      try {
        await weatherService.getWeatherData(normalizedLocation);
      } catch (error) {
        console.error("Error validating weather:", error);

        const message =
          error instanceof Error ? error.message : "Failed to fetch weather data";
        const status =
          error instanceof Error && error.message.includes("not found") ? 404 : 500;

        return res.status(status).json(createErrorResponse(message, status));
      }
    }

    const widget = new Widget({
      location: normalizedLocation,
      locationKey,
    });
    const savedWidget = await widget.save();

    res.status(201).json(savedWidget);
  } catch (error) {
    console.error("Error creating widget:", error);

    if (error instanceof Error && "code" in error && error.code === 11000) {
      return res
        .status(409)
        .json(createErrorResponse("Widget already exists", 409));
    }

    res.status(500).json(createErrorResponse("Failed to create widget", 500));
  }
};

export const deleteWidget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || !Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json(createErrorResponse("Invalid widget ID format", 400));
    }

    const deletedWidget = await Widget.findByIdAndDelete(id);

    if (!deletedWidget) {
      return res.status(404).json(createErrorResponse("Widget not found", 404));
    }

    res.json({ message: "Widget deleted successfully" });
  } catch (error) {
    console.error("Error deleting widget:", error);
    res.status(500).json(createErrorResponse("Failed to delete widget", 500));
  }
};

export const getWidgetWeather = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || !Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json(createErrorResponse("Invalid widget ID format", 400));
    }

    const widget = await Widget.findById(id);

    if (!widget) {
      return res.status(404).json(createErrorResponse("Widget not found", 404));
    }

    const weatherData = await weatherService.getWeatherData(widget.location);
    res.json(weatherData);
  } catch (error) {
    console.error("Error fetching weather:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return res.status(404).json(createErrorResponse(error.message, 404));
    }

    res
      .status(500)
      .json(createErrorResponse("Failed to fetch weather data", 500));
  }
};
