import { Request, Response } from "express";
import {
  createWidget,
  getAllWidgets,
  deleteWidget,
} from "../../controllers/widgetController";
import Widget from "../../models/Widget";
import weatherCache from "../../cache/weatherCache";
import weatherService from "../../services/weather";
import { Types } from "mongoose";

jest.mock("../../models/Widget");
jest.mock("../../cache/weatherCache", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));
jest.mock("../../services/weather", () => ({
  __esModule: true,
  default: {
    getWeatherData: jest.fn(),
  },
}));

const MockedWidget = Widget as jest.Mocked<typeof Widget>;
const mockedCache = weatherCache as jest.Mocked<typeof weatherCache>;
const mockedWeatherService = weatherService as jest.Mocked<
  typeof weatherService
>;

describe("WidgetController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
    mockedCache.get.mockReset();
    mockedCache.set.mockReset();
    mockedWeatherService.getWeatherData.mockReset();
  });

  describe("createWidget", () => {
    it("should create widget with valid location", async () => {
      const savedWidget = {
        _id: "123",
        location: "Berlin",
        locationKey: "berlin",
        createdAt: new Date(),
      };

      mockRequest.body = { location: "Berlin" };
      MockedWidget.findOne = jest.fn().mockResolvedValue(null as any);
      MockedWidget.prototype.save = jest.fn().mockResolvedValue(savedWidget);
      mockedCache.get.mockReturnValueOnce(null);
      mockedWeatherService.getWeatherData.mockResolvedValueOnce({} as any);

      await createWidget(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(savedWidget);
      expect(MockedWidget.findOne).toHaveBeenCalledWith({ locationKey: "berlin" });
      expect(mockedCache.get).toHaveBeenCalledWith("Berlin");
      expect(mockedWeatherService.getWeatherData).toHaveBeenCalledWith("Berlin");
    });

    it("should return error for missing location", async () => {
      mockRequest.body = {};

      await createWidget(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Location is required and must be a string",
        })
      );
    });

    it("should reject duplicate widget when cache is fresh", async () => {
      const existingWidget = {
        _id: "123",
        location: "Berlin",
        locationKey: "berlin",
      };

      mockRequest.body = { location: "Berlin" };
      MockedWidget.findOne = jest.fn().mockResolvedValue(existingWidget as any);
      mockedCache.get.mockReturnValueOnce({} as any);

      await createWidget(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Widget already exists" })
      );
      expect(mockedWeatherService.getWeatherData).not.toHaveBeenCalled();
    });

    it("should refresh weather when duplicate cache is stale", async () => {
      const existingWidget = {
        _id: "123",
        location: "Berlin",
        locationKey: "berlin",
      };

      mockRequest.body = { location: "Berlin" };
      MockedWidget.findOne = jest.fn().mockResolvedValue(existingWidget as any);
      mockedCache.get.mockReturnValueOnce(null);
      mockedWeatherService.getWeatherData.mockResolvedValueOnce({} as any);

      await createWidget(mockRequest as Request, mockResponse as Response);

      expect(mockedWeatherService.getWeatherData).toHaveBeenCalledWith("Berlin");
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Widget already exists; weather refreshed",
        })
      );
    });
  });

  describe("getAllWidgets", () => {
    it("should return all widgets", async () => {
      const widgets = [
        { _id: "1", location: "Berlin", createdAt: new Date() },
        { _id: "2", location: "Paris", createdAt: new Date() },
      ];

      const mockFind = {
        sort: jest.fn().mockResolvedValue(widgets),
      };
      MockedWidget.find = jest.fn().mockReturnValue(mockFind);

      await getAllWidgets(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(widgets);
    });
  });

  describe("deleteWidget", () => {
    it("should delete existing widget", async () => {
      const validObjectId = new Types.ObjectId().toString();
      const deletedWidget = { _id: validObjectId, location: "Berlin" };

      mockRequest.params = { id: validObjectId };
      MockedWidget.findByIdAndDelete = jest
        .fn()
        .mockResolvedValue(deletedWidget);

      await deleteWidget(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Widget deleted successfully",
      });
    });

    it("should return error for invalid widget ID", async () => {
      mockRequest.params = { id: "invalid" };

      await deleteWidget(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Invalid widget ID format",
        })
      );
    });
  });
});
