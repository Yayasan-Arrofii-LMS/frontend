// API functions for student materials

export interface MaterialFile {
  id: number;
  url: string;
  type: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
  materialId?: number;
}

export interface StudentMaterial {
  id: number;
  title: string;
  content: string;
  xp: number;
  video_link?: string | null;
  createdAt: string;
  updatedAt: string;
  sectionId: number;
  order: number;
  Material_File: MaterialFile[];
}

export interface StudentMaterialFile {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  materialId: number;
  url: string;
}

export interface MaterialFilesResponse {
  success: boolean;
  message: string;
  data: StudentMaterialFile[];
}

export interface MaterialsResponse {
  success: boolean;
  message: string;
  data: StudentMaterial[];
}

/**
 * Fetch materials for a specific section
 */
export async function fetchSectionMaterials(
  sectionId: number
): Promise<StudentMaterial[]> {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

  // Get auth token from localStorage
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : "";

  const response = await fetch(
    `${API_BASE_URL}/students/classes/sections/${sectionId}/materials`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: "include",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch materials: ${response.status}`);
  }

  const result: MaterialsResponse = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to fetch materials");
  }

  return result.data;
}

/**
 * Fetch files for a specific material (student endpoint)
 */
export async function fetchStudentMaterialFiles(
  materialId: number
): Promise<StudentMaterialFile[]> {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

  // Get auth token from localStorage
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : "";

  console.log('[Student API] Fetching material files for materialId:', materialId);
  const endpoint = `${API_BASE_URL}/students/classes/sections/materials/${materialId}/files`;
  console.log('[Student API] Endpoint:', endpoint);

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch material files: ${response.status}`);
  }

  const result: MaterialFilesResponse = await response.json();
  console.log('[Student API] Response data:', result.data);

  if (!result.success) {
    throw new Error(result.message || "Failed to fetch material files");
  }

  return result.data;
}
