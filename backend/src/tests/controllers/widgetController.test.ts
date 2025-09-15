import { Request, Response } from "express";
import {
  createWidget,
  getAllWidgets,
  deleteWidget,
} from "../../controllers/widgetController";
import Widget from "../../models/Widget";
import { Types } from "mongoose";

jest.mock("../../models/Widget");
const MockedWidget = Widget as jest.Mocked<typeof Widget>;

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
  });

  describe("createWidget", () => {
    it("should create widget with valid location", async () => {
      const savedWidget = {
        _id: "123",
        location: "Berlin",
        createdAt: new Date(),
      };

      mockRequest.body = { location: "Berlin" };
      MockedWidget.prototype.save = jest.fn().mockResolvedValue(savedWidget);

      await createWidget(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(savedWidget);
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
