export interface Widget {
  _id: string;
  location: string;
  createdAt: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  cachedAt: string;
}

export interface CreateWidgetRequest {
  location: string;
}
