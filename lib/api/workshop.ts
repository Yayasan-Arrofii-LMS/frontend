import {
  Workshop,
  WorkshopFormData,
  Participant,
} from "@/types/workshop";
import { apiRequest as request, ApiError } from "./client";
export interface WorkshopFilterParams {
  search?: string;
  category?: string;
  type?: string;
  status?: string;
}

/**
 * 1. Mengambil daftar workshop dari backend
 */
export async function getWorkshopsApi(
  filters?: WorkshopFilterParams
): Promise<Workshop[]> {
  const params = new URLSearchParams();
  if (filters?.search && filters.search.trim()) {
    params.append("search", filters.search.trim());
  }
  if (filters?.category && filters.category !== "Semua") {
    params.append("category", filters.category);
  }
  if (filters?.type && filters.type !== "Semua") {
    params.append("type", filters.type);
  }
  if (filters?.status && filters.status !== "Semua") {
    params.append("status", filters.status);
  }

  const query = params.toString() ? `?${params.toString()}` : "";
  return request<Workshop[]>(`/workshops${query}`, { method: "GET" });
}

/**
 * 2. Mengambil detail workshop berdasarkan ID
 */
export async function getWorkshopByIdApi(id: string): Promise<Workshop> {
  return request<Workshop>(`/workshops/${id}`, { method: "GET" });
}

/**
 * 3. Membuat workshop baru (Admin / Teacher)
 */
export async function createWorkshopApi(
  data: WorkshopFormData
): Promise<Workshop> {
  // Jika mengunggah file thumbnail
  if (data.thumbnailFile instanceof File) {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("date", data.date);
    formData.append("startTime", data.startTime);
    formData.append("endTime", data.endTime);
    formData.append("type", data.type);
    formData.append("quota", String(data.quota));
    formData.append("category", data.category);
    if (data.location) formData.append("location", data.location);
    if (data.meetingLink) formData.append("meetingLink", data.meetingLink);
    if (data.instructorName) formData.append("instructorName", data.instructorName);
    if (data.instructorId) formData.append("instructorId", data.instructorId);
    formData.append("file", data.thumbnailFile);

    return request<Workshop>("/workshops", {
      method: "POST",
      body: formData,
    });
  }

  // Jika menggunakan URL thumbnail atau default
  return request<Workshop>("/workshops", {
    method: "POST",
    body: JSON.stringify({
      title: data.title,
      description: data.description,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      type: data.type,
      quota: data.quota,
      category: data.category,
      location: data.location || null,
      meetingLink: data.meetingLink || null,
      thumbnail: data.thumbnail || undefined,
      instructorName: data.instructorName || undefined,
      instructorId: data.instructorId || undefined,
    }),
  });
}

/**
 * 4. Memperbarui workshop (Admin / Teacher)
 */
export async function updateWorkshopApi(
  id: string,
  data: Partial<WorkshopFormData>
): Promise<Workshop> {
  if (data.thumbnailFile instanceof File) {
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    if (data.date) formData.append("date", data.date);
    if (data.startTime) formData.append("startTime", data.startTime);
    if (data.endTime) formData.append("endTime", data.endTime);
    if (data.type) formData.append("type", data.type);
    if (data.quota !== undefined) formData.append("quota", String(data.quota));
    if (data.category) formData.append("category", data.category);
    if (data.location !== undefined) formData.append("location", data.location || "");
    if (data.meetingLink !== undefined) formData.append("meetingLink", data.meetingLink || "");
    if (data.instructorName !== undefined) formData.append("instructorName", data.instructorName || "");
    if (data.instructorId !== undefined) formData.append("instructorId", data.instructorId || "");
    formData.append("file", data.thumbnailFile);

    return request<Workshop>(`/workshops/${id}`, {
      method: "PUT",
      body: formData,
    });
  }

  return request<Workshop>(`/workshops/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.date && { date: data.date }),
      ...(data.startTime && { startTime: data.startTime }),
      ...(data.endTime && { endTime: data.endTime }),
      ...(data.type && { type: data.type }),
      ...(data.quota !== undefined && { quota: data.quota }),
      ...(data.category && { category: data.category }),
      ...(data.location !== undefined && { location: data.location || null }),
      ...(data.meetingLink !== undefined && { meetingLink: data.meetingLink || null }),
      ...(data.thumbnail && { thumbnail: data.thumbnail }),
      ...(data.instructorName !== undefined && { instructorName: data.instructorName }),
      ...(data.instructorId !== undefined && { instructorId: data.instructorId }),
    }),
  });
}

/**
 * 5. Menghapus workshop (Admin / Teacher)
 */
export async function deleteWorkshopApi(id: string): Promise<void> {
  await request<null>(`/workshops/${id}`, { method: "DELETE" });
}

/**
 * 6. Mendaftar ke workshop
 */
export async function registerWorkshopApi(
  id: string,
  notes?: string
): Promise<Workshop> {
  return request<Workshop>(`/workshops/${id}/register`, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });
}

/**
 * 7. Membatalkan pendaftaran workshop
 */
export async function cancelWorkshopRegistrationApi(
  id: string
): Promise<Workshop> {
  return request<Workshop>(`/workshops/${id}/register`, {
    method: "DELETE",
  });
}

/**
 * 8. Mengambil daftar peserta workshop (Admin / Teacher)
 */
export async function getWorkshopParticipantsApi(
  id: string
): Promise<Participant[]> {
  return request<Participant[]>(`/workshops/${id}/participants`, {
    method: "GET",
  });
}
