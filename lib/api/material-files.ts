import { authenticatedFetch, ApiResponse } from "./client";

export interface MaterialFile {
  id: number;
  title: string;
  file_path?: string; // Old format
  path?: string; // New format from API
  createdAt: string;
  updatedAt: string;
  materialId: number;
}

export interface MaterialFilesResponse {
  success: boolean;
  message: string;
  data: MaterialFile[];
}

export interface MaterialFileResponse {
  success: boolean;
  message: string;
  data: MaterialFile;
}

// Admin/Teacher endpoints
export async function fetchMaterialFiles(
  materialId: number
): Promise<MaterialFile[]> {
  console.log('[API] Fetching material files for materialId:', materialId);
  const endpoint = `/classes/sections/materials/${materialId}/files`;
  console.log('[API] Endpoint:', endpoint);
  const response = await authenticatedFetch<MaterialFile[]>(endpoint);
  console.log('[API] Response data:', response.data);
  return response.data;
}

export async function createMaterialFile(
  materialId: number,
  data: FormData
): Promise<MaterialFile> {
  const token = localStorage.getItem("auth_token");
  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

  const endpoint = `${BASE_URL}/classes/sections/materials/${materialId}/files`;
  console.log("Upload endpoint:", endpoint);
  console.log("FormData keys:", Array.from(data.keys()));

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });

  console.log("Response status:", response.status);

  if (!response.ok) {
    let errorMessage = "Upload failed";
    try {
      const errorData = await response.json();
      console.error("Upload error response:", errorData);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // Response is not JSON, try to get text
      const textError = await response.text();
      console.error("Upload error (text):", textError);
      errorMessage =
        textError || `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const result: ApiResponse<MaterialFile> = await response.json();
  return result.data;
}

export async function updateMaterialFile(
  materialId: number,
  fileId: number,
  data: FormData
): Promise<MaterialFile> {
  const token = localStorage.getItem("auth_token");
  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

  const response = await fetch(
    `${BASE_URL}/classes/sections/materials/${materialId}/files/${fileId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    }
  );

  if (!response.ok) {
    let errorMessage = "Update failed";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      const textError = await response.text();
      errorMessage =
        textError || `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const result: ApiResponse<MaterialFile> = await response.json();
  return result.data;
}

export async function deleteMaterialFile(
  materialId: number,
  fileId: number
): Promise<void> {
  await authenticatedFetch(
    `/classes/sections/materials/${materialId}/files/${fileId}`,
    {
      method: "DELETE",
    }
  );
}

// Student endpoints
export async function fetchStudentMaterialFiles(
  materialId: number
): Promise<MaterialFile[]> {
  const response = await authenticatedFetch<MaterialFile[]>(
    `/students/classes/sections/materials/${materialId}/files`
  );
  return response.data;
}
