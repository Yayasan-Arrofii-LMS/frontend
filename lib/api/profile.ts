// API client untuk profile endpoints

export interface ProfileData {
  id: string;
  email: string;
  username: string;
  name: string;
  profileImage: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: ProfileData;
}

// Get user profile (server-side)
export async function getProfile(token: string): Promise<ProfileData> {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store", // Disable caching for profile data
  });

  if (!response.ok) {
    // Don't log 401 errors as they are expected when token is invalid/expired
    if (response.status !== 401) {
      console.error(`Profile fetch failed with status: ${response.status}`);
    }
    throw new Error(`Failed to fetch profile: ${response.status}`);
  }

  const result: ProfileResponse = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to get profile");
  }

  return result.data;
}
