export type MaterialType = "video" | "image" | "text" | "document";

export interface Material {
  id: string;
  title: string;
  description: string;
  type: MaterialType;
  content: string; // URL untuk video/image/document, atau text content
  youtubeUrl?: string; // Optional YouTube URL
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  order: number;
  materials: Material[];
  createdAt: string;
  updatedAt: string;
}

export interface ClassDetail {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  teacherId: string;
  teacherName: string;
  studentCount: number;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}
