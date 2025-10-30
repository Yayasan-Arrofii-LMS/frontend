// Material File from API
export interface MaterialFile {
  id: number;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}

// Material from API
export interface Material {
  id: number;
  title: string;
  content: string;
  xp?: number;
  sectionId: number;
  createdAt: string;
  updatedAt: string;
  Material_File: MaterialFile[];
}

// Section from API
export interface Section {
  id: number;
  title: string;
  description: string | null;
  order: number;
  Material: Material[];
  Assignment: unknown[]; // For future use
  Quiz: unknown[]; // For future use
}

// API Response types
export interface SectionsResponse {
  success: boolean;
  message: string;
  data: Section[];
}

export interface SectionResponse {
  success: boolean;
  message: string;
  data: Section;
}

export interface MaterialResponse {
  success: boolean;
  message: string;
  data: Material;
}

export interface MaterialsResponse {
  success: boolean;
  message: string;
  data: Material[];
}

// Input types for creating/updating
export interface CreateSectionInput {
  title: string;
  description?: string | null;
  order?: number;
}

export interface UpdateSectionInput {
  title?: string;
  description?: string | null;
  order?: number;
}

export interface CreateMaterialInput {
  title: string;
  content: string;
  xp?: number;
}

export interface UpdateMaterialInput {
  title?: string;
  content?: string;
  xp?: number;
}

// Class from API
export interface Class {
  id: number;
  name: string;
  description: string;
  image_path: string;
  image_path_relative: string;
  students: unknown[];
}

// API Response for class
export interface ClassResponse {
  success: boolean;
  message: string;
  data: Class;
}

// For displaying in UI (might not need separate interface)
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
