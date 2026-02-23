import { getAuthToken } from "./auth";
import { ApiResponse } from "./client";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

export interface MaterialImage {
  id?: number;
  url: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function uploadMaterialImage(
  file: File,
  options?: { title?: string }
): Promise<MaterialImage> {
  const token = getAuthToken();

  const formData = new FormData();
  formData.append("image", file);
  if (options?.title) {
    formData.append("title", options.title);
  }

  const response = await fetch(`${BASE_URL}/material-images`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = "Upload failed";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      const textError = await response.text();
      errorMessage = textError || `HTTP ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  const result: ApiResponse<MaterialImage> = await response.json();
  return result.data;
}

export async function deleteMaterialImages(urls: string[]): Promise<void> {
  if (!urls.length) return;

  const token = getAuthToken();

  const response = await fetch(`${BASE_URL}/material-images`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ urls }),
  });

  if (!response.ok) {
    let errorMessage = "Delete failed";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      const textError = await response.text();
      errorMessage = textError || `HTTP ${response.status}`;
    }
    throw new Error(errorMessage);
  }
}

export async function syncMaterialImageUsage(
  urls: string[]
): Promise<void> {
  const token = getAuthToken();

  const response = await fetch(`${BASE_URL}/material-images/sync-usage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ urls }),
  });

  if (!response.ok) {
    let errorMessage = "Sync failed";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      const textError = await response.text();
      errorMessage = textError || `HTTP ${response.status}`;
    }
    throw new Error(errorMessage);
  }
}
