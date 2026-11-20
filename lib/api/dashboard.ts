import { DashboardApiResponse, DashboardQueryParams } from "@/types/dashboard";
import { ApiError, handleApiError } from "@/lib/errors";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

export async function fetchDashboardData(
  params?: DashboardQueryParams
): Promise<DashboardApiResponse> {
  try {
    // Get token from localStorage (client-side) or cookies (server-side)
    let token: string | null = null;

    if (typeof window !== "undefined") {
      token = localStorage.getItem("auth_token");
    } else {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      token = cookieStore.get("auth_token")?.value || null;
    }

    if (!token) {
      throw new ApiError("Authentication token not found", 401);
    }

    const url = new URL(`${BASE_URL}/dashboard`);
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          url.searchParams.set(key, String(val));
        }
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new ApiError("Unauthorized - please login again", 401);
      }
      const errorMessage = `Failed to fetch dashboard data (${response.status})`;
      throw new ApiError(errorMessage, response.status);
    }

    const data = await response.json();

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
