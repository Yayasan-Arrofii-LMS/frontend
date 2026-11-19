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

/**
 * Update user profile (client-side)
 */
export async function updateProfile(data: {
  name?: string;
  email?: string;
  username?: string;
  profileImage?: string;
}): Promise<ProfileResponse> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : "";

  const response = await fetch("/api/auth/profile", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal memperbarui profil");
  }

  // Update local user info and trigger auth refresh
  if (typeof window !== "undefined") {
    const existing = localStorage.getItem("user_info");
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        const updated = {
          ...parsed,
          name: data.name || parsed.name,
          email: data.email || parsed.email,
          username: data.username || parsed.username,
        };
        localStorage.setItem("user_info", JSON.stringify(updated));
        window.dispatchEvent(new Event("auth-changed"));
      } catch {
        // Ignore JSON error
      }
    }
  }

  return result;
}

/**
 * Change user password (client-side)
 */
export async function changeUserPassword(data: {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ success: boolean; message: string }> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : "";
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

  const response = await fetch(`${API_BASE_URL}/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || (result && result.success === false)) {
    throw new Error(result.message || "Gagal mengubah kata sandi");
  }

  return {
    success: true,
    message: result.message || "Kata sandi berhasil diperbarui",
  };
}
