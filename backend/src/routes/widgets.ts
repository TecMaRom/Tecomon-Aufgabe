import express from "express";
import {
  getAllWidgets,
  createWidget,
  getWidgetWeather,
  deleteWidget,
} from "../controllers/widgetController";

const router = express.Router();
router.get("/", getAllWidgets);
router.post("/", createWidget);
router.delete("/:id", deleteWidget);
router.get("/:id/weather", getWidgetWeather);

export default router;
