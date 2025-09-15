export const validateLocation = (location: string): string | null => {
  if (!location || typeof location !== "string") {
    return "Location is required and must be a string";
  }

  const trimmedLocation = location.trim();

  if (trimmedLocation.length === 0) {
    return "Location cannot be empty";
  }

  if (trimmedLocation.length > 100) {
    return "Location must be less than 100 characters";
  }

  if (!/^[a-zA-Z\s\-,.']+$/.test(trimmedLocation)) {
    return "Location contains invalid characters";
  }

  return null;
};

export const createErrorResponse = (
  message: string,
  statusCode: number = 500
) => {
  return {
    error: message,
    timestamp: new Date().toISOString(),
    statusCode,
  };
};
