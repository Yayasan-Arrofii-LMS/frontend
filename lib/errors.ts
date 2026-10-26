export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: unknown,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }

  // Backward compatibility alias for statusCode
  get statusCode(): number | undefined {
    return this.status;
  }
  set statusCode(val: number | undefined) {
    this.status = val;
  }
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError("An unknown error occurred");
}