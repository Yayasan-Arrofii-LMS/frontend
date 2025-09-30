import { DashboardApiResponse } from "@/types/dashboard";
import { ApiError, handleApiError } from "@/lib/errors";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export async function fetchDashboardData(): Promise<DashboardApiResponse> {
  try {
    const response = await fetch(`${BASE_URL}/dashboard`, {
      headers: {
        "Content-Type": "application/json",
      },
      // Add cache settings for server components
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!response.ok) {
      const errorMessage = `Failed to fetch dashboard data (${response.status})`;
      throw new ApiError(errorMessage, response.status);
    }

    const data = await response.json();

    // Validate response structure
    if (!data || typeof data.success !== "boolean") {
      throw new ApiError("Invalid API response format");
    }

    return data;
  } catch (error) {
    const apiError = handleApiError(error);
    console.error("Error fetching dashboard data:", apiError);
    throw apiError;
  }
}
