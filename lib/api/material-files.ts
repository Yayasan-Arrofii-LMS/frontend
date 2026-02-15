import { authenticatedFetch, ApiResponse } from "./client";

export interface MaterialFile {
  id: number;
  title: string;
  url: string;
  materialId: number;
  createdAt: string;
  updatedAt: string;
  // Legacy fields (optional for backward compatibility)
  filename?: string;
  file_path?: string;
  path?: string;
  size?: number;
  mimeType?: string;
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
  materialId: number,
): Promise<MaterialFile[]> {
  console.log("[API] Fetching material files for materialId:", materialId);
  const endpoint = `/classes/sections/materials/${materialId}/files`;
  console.log("[API] Endpoint:", endpoint);
  const response = await authenticatedFetch<MaterialFile[]>(endpoint);
  console.log("[API] Response data:", response.data);
  return response.data;
}

export async function createMaterialFile(
  materialId: number,
  data: FormData,
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
  data: FormData,
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
    },
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
  fileId: number,
): Promise<void> {
  await authenticatedFetch(
    `/classes/sections/materials/${materialId}/files/${fileId}`,
    {
      method: "DELETE",
    },
  );
}

// Student endpoints
export async function fetchStudentMaterialFiles(
  materialId: number,
): Promise<MaterialFile[]> {
  const response = await authenticatedFetch<MaterialFile[]>(
    `/students/classes/sections/materials/${materialId}/files`,
  );
  return response.data;
}

export async function downloadFileWithAuth(url: string): Promise<Blob> {
  const token = localStorage.getItem("auth_token");
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

  // Base URL for static files (remove /api/v1)
  const BASE_URL = API_BASE_URL.replace("/api/v1", "");

  // Ensure path is relative and clean
  let path = url;

  // Convert full URL to relative path if needed
  if (url.startsWith("http")) {
    try {
      const urlObj = new URL(url);
      path = urlObj.pathname;
    } catch {
      // Keep as is if invalid URL
    }
  }

  // Remove leading slash
  if (path.startsWith("/")) path = path.slice(1);

  // Convert backslashes to forward slashes (fix Windows paths)
  path = path.replace(/\\/g, "/");

  console.log("[downloadFileWithAuth] Fetching:", `${BASE_URL}/${path}`);

  const response = await fetch(`${BASE_URL}/${path}`, {
    method: "GET",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) {
      throw new Error(
        "Access Denied: You do not have permission to view this file.",
      );
    }
    throw new Error(
      `Failed to download file: ${response.status} ${response.statusText}`,
    );
  }

  return await response.blob();
}
