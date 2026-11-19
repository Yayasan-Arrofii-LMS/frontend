export interface Class {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  teacherId: string;
  teacherName: string;
  teachers?: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  createdAt: string;
  updatedAt: string;
  studentCount?: number;
  categoryId?: number | null;
  category?: string | { id: number; name: string } | null;
  registrationType?: "AUTO" | "MANUAL";
}

// API Response Types
export interface ApiClass {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
  categoryId?: number | null;
  category?: {
    id: number;
    name: string;
  } | null;
  registrationType?: "AUTO" | "MANUAL";
  teacher?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    students: number;
  };
}

export interface ClassesApiResponse {
  success: boolean;
  message: string;
  data: ApiClass[];
  meta: {
    itemCount: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface CreateClassRequest {
  title: string;
  description: string;
  coverImage?: File | null;
  categoryId?: number | null;
  registrationType?: "AUTO" | "MANUAL";
}

export interface CreateClassResponse {
  success: boolean;
  message: string;
  data: ApiClass;
}

export interface UpdateClassRequest {
  title?: string;
  description?: string;
  coverImage?: File | null;
  categoryId?: number | null;
  registrationType?: "AUTO" | "MANUAL";
}

export interface UpdateClassResponse {
  success: boolean;
  message: string;
  data: ApiClass;
}

export interface DeleteClassResponse {
  success: boolean;
  message: string;
}

export interface Applicant {
  id: number;
  role: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  userId: string;
  classId: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    profileImage?: string;
  };
}
