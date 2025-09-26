export interface Teacher {
  id: string;
  profilePhoto: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  subjects: string[];
  joinDate: string;
  status: "active" | "inactive";
}

// API Response Types
export interface ApiTeacher {
  id: string;
  email: string;
  username: string;
  name: string;
  password: string;
  profileImage: string;
  verified_at: string | null;
  createdAt: string;
  updatedAt: string;
  roleId: number;
  role: {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface TeachersApiResponse {
  success: boolean;
  message: string;
  data: ApiTeacher[];
  meta: {
    itemCount: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
