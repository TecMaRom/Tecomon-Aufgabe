import { Widget, WeatherData, CreateWidgetRequest } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error || `HTTP ${response.status}: ${response.statusText}`
    );
  }
  return response.json();
};

export const getWidgets = async (): Promise<Widget[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/widgets`);
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error fetching widgets:", error);
    throw error;
  }
};

export const createWidget = async (
  data: CreateWidgetRequest
): Promise<Widget> => {
  try {
    const response = await fetch(`${API_BASE_URL}/widgets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error creating widget:", error);
    throw error;
  }
};

export interface DeleteWidgetResponse {
  message: string;
}

export const deleteWidget = async (
  id: string
): Promise<DeleteWidgetResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/widgets/${id}`, {
      method: "DELETE",
    });
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error deleting widget:", error);
    throw error;
  }
};

export const getWeatherData = async (id: string): Promise<WeatherData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/widgets/${id}/weather`);
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
};
