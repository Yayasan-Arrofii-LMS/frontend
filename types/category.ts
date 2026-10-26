export interface Category {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    materials?: number;
    classes?: number;
    interests?: number;
  };
}

export interface CategoriesApiResponse {
  success: boolean;
  message: string;
  data: Category[];
}
