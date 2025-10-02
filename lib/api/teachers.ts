import {
  Teacher,
  TeachersApiResponse,
  ApiTeacher,
  CreateTeacherRequest,
  CreateTeacherResponse,
  DeleteTeacherResponse,
  UpdateTeacherRequest,
  UpdateTeacherResponse,
} from "@/types/teacher";
import { ApiError, handleApiError } from "@/lib/errors";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

function transformApiTeacher(apiTeacher: ApiTeacher): Teacher {
  return {
    id: apiTeacher.id,
    profilePhoto: apiTeacher.profileImage,
    fullName: apiTeacher.name,
    username: apiTeacher.username,
    email: apiTeacher.email,
    phoneNumber: "", // Not available in API response
    address: "", // Not available in API response
    dateOfBirth: "", // Not available in API response
    subjects: [], // Not available in API response
    joinDate: apiTeacher.createdAt,
    status: apiTeacher.verified_at ? "active" : "inactive",
  };
}

export async function fetchTeachers(
  page: number = 1,
  search?: string
): Promise<{
  teachers: Teacher[];
  meta: TeachersApiResponse["meta"];
}> {
  try {
    // Build query parameters
    const params = new URLSearchParams({
      page: page.toString(),
    });

    if (search && search.trim()) {
      params.append("search", search.trim());
    }

    const response = await fetch(`${BASE_URL}/teachers?${params.toString()}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorMessage = `Failed to fetch teachers (${response.status})`;
      throw new ApiError(errorMessage, response.status);
    }

    const data: TeachersApiResponse = await response.json();

    // Validate response structure
    if (
      !data ||
      typeof data.success !== "boolean" ||
      !Array.isArray(data.data)
    ) {
      throw new ApiError("Invalid API response format");
    }

    if (!data.success) {
      throw new ApiError(data.message || "API request failed");
    }

    return {
      teachers: data.data.map(transformApiTeacher),
      meta: data.meta,
    };
  } catch (error) {
    const apiError = handleApiError(error);
    console.error("Error fetching teachers:", {
      message: apiError.message,
      status: apiError.status,
      baseUrl: BASE_URL,
      page,
      search,
    });
    throw apiError;
  }
}

export async function createTeacher(
  teacherData: Omit<CreateTeacherRequest, "password" | "passwordConfirmation">
): Promise<Teacher> {
  // Use username as default password for new teachers
  const defaultPassword = teacherData.username;

  const requestData: CreateTeacherRequest = {
    ...teacherData,
    password: defaultPassword,
    passwordConfirmation: defaultPassword,
  };

  try {
    const response = await fetch(`${BASE_URL}/teachers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorMessage = `Failed to create teacher (${response.status})`;
      throw new ApiError(errorMessage, response.status);
    }

    const data: CreateTeacherResponse = await response.json();

    // Validate response structure
    if (!data || typeof data.success !== "boolean" || !data.data) {
      throw new ApiError("Invalid API response format");
    }

    if (!data.success) {
      throw new ApiError(data.message || "API request failed");
    }

    return transformApiTeacher(data.data);
  } catch (error) {
    const apiError = handleApiError(error);
    console.error("Error creating teacher:", {
      message: apiError.message,
      status: apiError.status,
      baseUrl: BASE_URL,
    });
    throw apiError;
  }
}

export async function deleteTeacher(teacherId: string): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/teachers/${teacherId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorMessage = `Failed to delete teacher (${response.status})`;
      throw new ApiError(errorMessage, response.status);
    }

    const data: DeleteTeacherResponse = await response.json();

    // Validate response structure
    if (!data || typeof data.success !== "boolean") {
      throw new ApiError("Invalid API response format");
    }

    if (!data.success) {
      throw new ApiError(data.message || "API request failed");
    }
  } catch (error) {
    const apiError = handleApiError(error);
    console.error("Error deleting teacher:", {
      message: apiError.message,
      status: apiError.status,
      baseUrl: BASE_URL,
      teacherId,
    });
    throw apiError;
  }
}

export async function updateTeacher(
  teacherId: string,
  teacherData: UpdateTeacherRequest
): Promise<Teacher> {
  try {
    const response = await fetch(`${BASE_URL}/teachers/${teacherId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(teacherData),
    });

    if (!response.ok) {
      const errorMessage = `Failed to update teacher (${response.status})`;
      throw new ApiError(errorMessage, response.status);
    }

    const data: UpdateTeacherResponse = await response.json();

    // Validate response structure
    if (!data || typeof data.success !== "boolean" || !data.data) {
      throw new ApiError("Invalid API response format");
    }

    if (!data.success) {
      throw new ApiError(data.message || "API request failed");
    }

    return transformApiTeacher(data.data);
  } catch (error) {
    const apiError = handleApiError(error);
    console.error("Error updating teacher:", {
      message: apiError.message,
      status: apiError.status,
      baseUrl: BASE_URL,
      teacherId,
    });
    throw apiError;
  }
}
