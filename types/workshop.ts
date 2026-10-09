export type WorkshopType = "Online" | "Offline";

export type WorkshopCategory =
  | "Sains Alam"
  | "Keterampilan Hidup"
  | "Kewirausahaan"
  | "Budaya"
  | "Teknologi & Lingkungan";

export type WorkshopStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";

export type RegistrationStatus = "Terdaftar" | "Dibatalkan";

export interface Participant {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string | null;
  registrationDate: string;
  status: RegistrationStatus;
  notes?: string;
}

export interface Workshop {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: WorkshopCategory;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  type: WorkshopType;
  location?: string; // Required for Offline
  meetingLink?: string; // Required for Online
  quota: number;
  registeredCount: number;
  instructorId: string;
  instructorName: string;
  instructorAvatar?: string | null;
  instructorBio?: string;
  status: WorkshopStatus;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkshopFormData {
  title: string;
  description: string;
  thumbnail: string;
  category: WorkshopCategory;
  date: string;
  startTime: string;
  endTime: string;
  type: WorkshopType;
  location?: string;
  meetingLink?: string;
  quota: number;
}
