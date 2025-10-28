export interface Class {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  teacherId: string;
  teacherName: string;
  createdAt: string;
  updatedAt: string;
  studentCount?: number;
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
