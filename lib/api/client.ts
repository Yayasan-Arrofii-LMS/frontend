import { getAuthToken, removeAuthToken } from "./auth";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Authenticated fetch wrapper
 * Automatically includes auth token and handles common errors
 */
export async function authenticatedFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      removeAuthToken();

      // Redirect to login if in browser
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      throw new ApiError("Unauthorized. Please login again.", 401);
    }

    // Parse response
    const data = await response.json().catch(() => ({
      success: false,
      message: "Invalid response format",
      data: null,
    }));

    // Handle non-2xx responses
    if (!response.ok) {
      throw new ApiError(
        data.message || "Request failed",
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    // Re-throw ApiError
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw new ApiError("Network error. Please check your connection.");
    }

    // Handle other errors
    throw new ApiError(
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
}

/**
 * GET request
 */
export async function get<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
  return authenticatedFetch<T>(endpoint, {
    method: "GET",
  });
}

/**
 * POST request
 */
export async function post<T = unknown>(
  endpoint: string,
  data?: unknown
): Promise<ApiResponse<T>> {
  return authenticatedFetch<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * PUT request
 */
export async function put<T = unknown>(
  endpoint: string,
  data?: unknown
): Promise<ApiResponse<T>> {
  return authenticatedFetch<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request
 */
export async function del<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
  return authenticatedFetch<T>(endpoint, {
    method: "DELETE",
  });
}

/**
 * PATCH request
 */
export async function patch<T = unknown>(
  endpoint: string,
  data?: unknown
): Promise<ApiResponse<T>> {
  return authenticatedFetch<T>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
