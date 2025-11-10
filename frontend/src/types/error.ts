export interface ApiError {
  response?: {
    data?: {
      message?: string;
      statusCode?: number;
    };
  };
  message?: string;
}
