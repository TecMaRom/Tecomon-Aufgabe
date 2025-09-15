import { Request, Response } from "express";
import Widget from "../models/Widget";
import { Types } from "mongoose";
import weatherService from "../services/weather";
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

    const widget = new Widget({ location: location.trim() });
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
