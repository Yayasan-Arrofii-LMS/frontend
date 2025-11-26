import { ApiError, handleApiError } from "../errors";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

async function getToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    return (await cookies()).get("auth_token")?.value || null;
  }
  return localStorage.getItem("auth_token");
}

export interface EnrollmentResponse {
  id: number;
  role: string;
  userId: string;
  classId: number;
  createdAt: string;
  updatedAt: string;
  class: {
    id: number;
    name: string;
    description: string;
    image_path: string;
    createdAt: string;
    updatedAt: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    profileImage: string;
  };
}

export interface EnrolledClass {
  id: number;
  role: string;
  userId: string;
  classId: number;
  createdAt: string;
  updatedAt: string;
  class: {
    id: number;
    name: string;
    description: string;
    image_path: string;
    createdAt: string;
    updatedAt: string;
    Section: Array<{
      id: number;
      name: string;
      description: string;
    }>;
    _count: {
      User_Class: number;
    };
  };
}

export interface MyClassesResponse {
  success: boolean;
  message: string;
  data: EnrolledClass[];
}

/**
 * Enroll in a class
 */
export async function enrollClass(
  classId: number
): Promise<EnrollmentResponse> {
  try {
    const token = await getToken();

    if (!token) {
      throw new ApiError("Authentication required", 401);
    }

    const response = await fetch(`${BASE_URL}/enrollment/enroll`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ classId }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new ApiError(
        data.message || `Failed to enroll (${response.status})`,
        response.status
      );
    }

    return data.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Unenroll from a class
 */
export async function unenrollClass(classId: number): Promise<void> {
  try {
    const token = await getToken();

    if (!token) {
      throw new ApiError("Authentication required", 401);
    }

    const response = await fetch(`${BASE_URL}/enrollment/unenroll`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ classId }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new ApiError(
        data.message || `Failed to unenroll (${response.status})`,
        response.status
      );
    }
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Check if user is enrolled in a class
 */
export async function checkEnrollmentStatus(classId: number): Promise<boolean> {
  try {
    const token = await getToken();

    if (!token) {
      return false;
    }

    const response = await fetch(`${BASE_URL}/enrollment/status/${classId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return false;
    }

    return data.data?.isEnrolled || false;
  } catch {
    return false;
  }
}

/**
 * Get all enrolled classes for the current user
 */
export async function fetchMyClasses(): Promise<EnrolledClass[]> {
  try {
    const token = await getToken();

    if (!token) {
      throw new ApiError("Authentication required", 401);
    }

    const response = await fetch(`${BASE_URL}/enrollment/my-classes`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data: MyClassesResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new ApiError(
        data.message || `Failed to fetch enrolled classes (${response.status})`,
        response.status
      );
    }

    return data.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
