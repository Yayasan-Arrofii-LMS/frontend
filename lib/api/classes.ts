import {
  Class,
  ClassesApiResponse,
  CreateClassRequest,
  UpdateClassRequest,
} from "@/types/class";
import { ApiError, handleApiError } from "@/lib/errors";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

// Helper to get auth token
async function getToken(): Promise<string | null> {
  if (typeof window !== "undefined") {
    // Client-side: get from localStorage
    return localStorage.getItem("auth_token");
  } else {
    // Server-side: get from cookies
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return cookieStore.get("auth_token")?.value || null;
  }
}

export async function fetchClasses(
  page: number = 1,
  search?: string
): Promise<{
  classes: Class[];
  meta: ClassesApiResponse["meta"];
}> {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new ApiError("Authentication required", 401);
    }

    // Build URL dengan query params
    const url = new URL(`${BASE_URL}/classes`);
    url.searchParams.append("page", page.toString());
    if (search && search.trim() !== "") {
      url.searchParams.append("search", search.trim());
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();

    // Check if request failed
    if (!response.ok || !data.success) {
      throw new ApiError(
        data.message || `Failed to fetch classes (${response.status})`,
        response.status
      );
    }

    // Transform API response to frontend format
    const classes: Class[] = data.data.map((apiClass: {
      id: number;
      name: string;
      description: string;
      image_path: string;
      image_path_relative: string;
    }) => ({
      id: apiClass.id.toString(),
      title: apiClass.name,
      description: apiClass.description,
      coverImage: apiClass.image_path_relative,
      teacherId: "teacher-1", // TODO: Get from API when available
      teacherName: "Unknown Teacher", // TODO: Get from API when available
      createdAt: new Date().toISOString(), // TODO: Get from API when available
      updatedAt: new Date().toISOString(), // TODO: Get from API when available
      studentCount: 0, // TODO: Get from API when available
    }));

    return {
      classes,
      meta: data.meta || {
        itemCount: classes.length,
        totalItems: classes.length,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: page,
      },
    };
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function createClass(data: CreateClassRequest): Promise<Class> {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new ApiError("Authentication required", 401);
    }

    // Prepare form data untuk mengirim file
    const formData = new FormData();
    formData.append("name", data.title);
    formData.append("description", data.description);
    
    // Jika ada cover image, tambahkan ke form data dengan nama field "file" sesuai backend
    if (data.coverImage) {
      formData.append("file", data.coverImage);
    }

    const response = await fetch(`${BASE_URL}/classes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Jangan set Content-Type untuk FormData, browser akan set otomatis dengan boundary
      },
      body: formData,
    });

    const responseData = await response.json();

    // Check if request failed
    if (!response.ok || !responseData.success) {
      throw new ApiError(
        responseData.message || `Failed to create class (${response.status})`,
        response.status
      );
    }

    // Validate response structure
    if (!responseData.data) {
      throw new ApiError("Invalid API response format");
    }

    // Transform API response to frontend format
    const apiClass = responseData.data;
    const newClass: Class = {
      id: apiClass.id.toString(),
      title: apiClass.name,
      description: apiClass.description,
      coverImage: apiClass.image_path_relative || apiClass.image_path || "",
      teacherId: "teacher-1", // TODO: Get from API when available
      teacherName: "Unknown Teacher", // TODO: Get from API when available
      createdAt: new Date().toISOString(), // TODO: Get from API when available
      updatedAt: new Date().toISOString(), // TODO: Get from API when available
      studentCount: 0, // TODO: Get from API when available
    };

    return newClass;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function updateClass(
  id: string,
  data: UpdateClassRequest
): Promise<Class> {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new ApiError("Authentication required", 401);
    }

    // Prepare form data
    const formData = new FormData();
    if (data.title) {
      formData.append("name", data.title);
    }
    if (data.description) {
      formData.append("description", data.description);
    }
    if (data.coverImage) {
      formData.append("file", data.coverImage);
    }

    const response = await fetch(`${BASE_URL}/classes/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const responseData = await response.json();

    // Check if request failed
    if (!response.ok || !responseData.success) {
      throw new ApiError(
        responseData.message || `Failed to update class (${response.status})`,
        response.status
      );
    }

    // Validate response structure
    if (!responseData.data) {
      throw new ApiError("Invalid API response format");
    }

    // Transform API response to frontend format
    const apiClass = responseData.data;
    const updatedClass: Class = {
      id: apiClass.id.toString(),
      title: apiClass.name,
      description: apiClass.description,
      coverImage: apiClass.image_path_relative || apiClass.image_path || "",
      teacherId: "teacher-1",
      teacherName: "Unknown Teacher",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      studentCount: 0,
    };

    return updatedClass;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function deleteClass(id: string): Promise<void> {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new ApiError("Authentication required", 401);
    }

    const response = await fetch(`${BASE_URL}/classes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    // Check if request failed
    if (!response.ok || !data.success) {
      throw new ApiError(
        data.message || `Failed to delete class (${response.status})`,
        response.status
      );
    }
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getClassById(id: string): Promise<Class> {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new ApiError("Authentication required", 401);
    }

    const response = await fetch(`${BASE_URL}/classes/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();

    // Check if request failed
    if (!response.ok || !data.success) {
      throw new ApiError(
        data.message || `Failed to get class (${response.status})`,
        response.status
      );
    }

    // Validate response structure
    if (!data.data) {
      throw new ApiError("Invalid API response format");
    }

    // Transform API response to frontend format
    const apiClass = data.data;
    const classData: Class = {
      id: apiClass.id.toString(),
      title: apiClass.name,
      description: apiClass.description,
      coverImage: apiClass.image_path_relative || apiClass.image_path || "",
      teacherId: "teacher-1",
      teacherName: "Unknown Teacher",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      studentCount: 0,
    };

    return classData;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Fetch public classes (no authentication required)
 * Used for home page and public viewing
 */
export async function fetchPublicClasses(
  page: number = 1
): Promise<{
  classes: Class[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}> {
  try {
    const url = new URL(`${BASE_URL}/public/classes`);
    url.searchParams.append("page", page.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const responseData = await response.json();

    // Check if request failed
    if (!response.ok || !responseData.success) {
      throw new ApiError(
        responseData.message || `Failed to fetch public classes (${response.status})`,
        response.status
      );
    }

    // Transform API response to frontend format
    const classes: Class[] = responseData.data.classes.map((apiClass: {
      id: number;
      name: string;
      description: string;
      image_path: string;
      image_path_relative: string;
    }) => ({
      id: apiClass.id.toString(),
      title: apiClass.name,
      description: apiClass.description,
      coverImage: apiClass.image_path_relative,
      teacherId: "",
      teacherName: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      studentCount: 0,
    }));

    return {
      classes,
      meta: responseData.data.meta,
    };
  } catch (error) {
    throw handleApiError(error);
  }
}
