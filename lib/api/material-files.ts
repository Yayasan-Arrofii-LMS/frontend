import { authenticatedFetch, ApiResponse } from "./client";

export interface MaterialFile {
  id: number;
  title: string;
  path: string;
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
  sectionId: number,
  materialId: number
): Promise<MaterialFile[]> {
  const response = await authenticatedFetch<MaterialFile[]>(
    `/classes/sections/${sectionId}/materials/${materialId}/files`
  );
  return response.data;
}

export async function createMaterialFile(
  sectionId: number,
  materialId: number,
  data: FormData
): Promise<MaterialFile> {
  const token = localStorage.getItem("auth_token");
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";
  
  const response = await fetch(`${BASE_URL}/classes/sections/${sectionId}/materials/${materialId}/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Upload failed" }));
    throw new Error(error.message || "Failed to upload file");
  }

  const result: ApiResponse<MaterialFile> = await response.json();
  return result.data;
}

export async function updateMaterialFile(
  sectionId: number,
  materialId: number,
  fileId: number,
  data: FormData
): Promise<MaterialFile> {
  const token = localStorage.getItem("auth_token");
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";
  
  const response = await fetch(`${BASE_URL}/classes/sections/${sectionId}/materials/${materialId}/files/${fileId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: data,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Update failed" }));
    throw new Error(error.message || "Failed to update file");
  }

  const result: ApiResponse<MaterialFile> = await response.json();
  return result.data;
}

export async function deleteMaterialFile(
  sectionId: number,
  materialId: number,
  fileId: number
): Promise<void> {
  await authenticatedFetch(`/classes/sections/${sectionId}/materials/${materialId}/files/${fileId}`, {
    method: "DELETE",
  });
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
