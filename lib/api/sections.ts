import {
  ClassDetail,
  Class,
  ClassResponse,
  Section,
  Material,
  SectionsResponse,
  SectionResponse,
  MaterialResponse,
  MaterialsResponse,
  CreateSectionInput,
  UpdateSectionInput,
  CreateMaterialInput,
  UpdateMaterialInput,
} from "@/types/section";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

// Helper function to get auth token
function getAuthToken(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token") || "";
  }
  return "";
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "An error occurred",
    }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Fetch class by ID
export async function fetchClass(classId: string): Promise<Class> {
  try {
    const response = await apiCall<ClassResponse>(`/classes/${classId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching class:", error);
    throw error;
  }
}

// Fetch all sections for a class
export async function fetchSections(classId: string): Promise<Section[]> {
  try {
    const response = await apiCall<SectionsResponse>(
      `/classes/${classId}/sections`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching sections:", error);
    throw error;
  }
}

// Fetch all materials for a section
export async function fetchMaterials(sectionId: number): Promise<Material[]> {
  try {
    const response = await apiCall<MaterialsResponse>(
      `/classes/sections/${sectionId}/materials`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching materials:", error);
    throw error;
  }
}

// Fetch class detail with sections and materials
export async function fetchClassDetail(classId: string): Promise<ClassDetail> {
  try {
    // Fetch class info and sections in parallel
    const [classInfo, sections] = await Promise.all([
      fetchClass(classId),
      fetchSections(classId),
    ]);

    // Fetch materials for each section
    const sectionsWithMaterials = await Promise.all(
      sections.map(async (section) => {
        try {
          const materials = await fetchMaterials(section.id);
          return {
            ...section,
            Material: materials,
          };
        } catch (error) {
          console.error(
            `Error fetching materials for section ${section.id}:`,
            error
          );
          // Return section with empty materials on error
          return section;
        }
      })
    );

    // Map API response to ClassDetail format
    const classDetail: ClassDetail = {
      id: classId,
      title: classInfo.name,
      description: classInfo.description,
      coverImage: classInfo.image_path_relative,
      teacherId: "teacher-1", // TODO: Get from API when available
      teacherName: "Budi Santoso", // TODO: Get from API when available
      studentCount: classInfo.students.length,
      sections: sectionsWithMaterials,
      createdAt: new Date().toISOString(), // TODO: Get from API when available
      updatedAt: new Date().toISOString(), // TODO: Get from API when available
    };

    return classDetail;
  } catch (error) {
    console.error("Error fetching class detail:", error);
    throw error;
  }
}

// Create a new section
export async function createSection(
  classId: string,
  data: CreateSectionInput
): Promise<Section> {
  try {
    const response = await apiCall<SectionResponse>(
      `/classes/${classId}/sections`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating section:", error);
    throw error;
  }
}

// Update a section
export async function updateSection(
  classId: string,
  sectionId: number,
  data: UpdateSectionInput
): Promise<Section> {
  try {
    const response = await apiCall<SectionResponse>(
      `/classes/${classId}/sections/${sectionId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating section:", error);
    throw error;
  }
}

// Delete a section
export async function deleteSection(
  classId: string,
  sectionId: number
): Promise<void> {
  try {
    await apiCall<{ success: boolean; message: string }>(
      `/classes/${classId}/sections/${sectionId}`,
      {
        method: "DELETE",
      }
    );
  } catch (error) {
    console.error("Error deleting section:", error);
    throw error;
  }
}

// Create a new material
export async function createMaterial(
  classId: string,
  sectionId: number,
  data: CreateMaterialInput
): Promise<Material> {
  try {
    const response = await apiCall<MaterialResponse>(
      `/classes/sections/${sectionId}/materials`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating material:", error);
    throw error;
  }
}

// Update a material
export async function updateMaterial(
  classId: string,
  sectionId: number,
  materialId: number,
  data: UpdateMaterialInput
): Promise<Material> {
  try {
    const response = await apiCall<MaterialResponse>(
      `/classes/sections/${sectionId}/materials/${materialId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating material:", error);
    throw error;
  }
}

// Delete a material
export async function deleteMaterial(
  classId: string,
  sectionId: number,
  materialId: number
): Promise<void> {
  try {
    await apiCall<{ success: boolean; message: string }>(
      `/classes/sections/${sectionId}/materials/${materialId}`,
      {
        method: "DELETE",
      }
    );
  } catch (error) {
    console.error("Error deleting material:", error);
    throw error;
  }
}

// Reorder sections
export async function reorderSections(
  classId: string,
  sectionOrders: { id: number; order: number }[],
  originalOrders?: { id: number; order: number }[]
): Promise<void> {
  try {
    // If original orders provided, only update sections that changed
    if (originalOrders) {
      const changedSections = sectionOrders.filter((newOrder) => {
        const original = originalOrders.find((o) => o.id === newOrder.id);
        return !original || original.order !== newOrder.order;
      });

      if (changedSections.length === 0) {
        return; // No changes needed
      }

      // Update only changed sections
      await Promise.all(
        changedSections.map((item) =>
          updateSection(classId, item.id, { order: item.order })
        )
      );
    } else {
      // Update all sections if no original orders provided
      await Promise.all(
        sectionOrders.map((item) =>
          updateSection(classId, item.id, { order: item.order })
        )
      );
    }
  } catch (error) {
    console.error("Error reordering sections:", error);
    throw error;
  }
}

// Reorder materials within a section
export async function reorderMaterials(
  classId: string,
  sectionId: number,
  materialOrders: { id: number; order: number }[],
  originalOrders?: { id: number; order: number }[]
): Promise<void> {
  try {
    // If original orders provided, only update materials that changed
    if (originalOrders) {
      const changedMaterials = materialOrders.filter((newOrder) => {
        const original = originalOrders.find((o) => o.id === newOrder.id);
        return !original || original.order !== newOrder.order;
      });

      if (changedMaterials.length === 0) {
        return; // No changes needed
      }

      // Update only changed materials
      await Promise.all(
        changedMaterials.map((item) =>
          apiCall(`/classes/sections/${sectionId}/materials/${item.id}`, {
            method: "PATCH",
            body: JSON.stringify({ order: item.order }),
          })
        )
      );
    } else {
      // Update all materials if no original orders provided
      await Promise.all(
        materialOrders.map((item) =>
          apiCall(`/classes/sections/${sectionId}/materials/${item.id}`, {
            method: "PATCH",
            body: JSON.stringify({ order: item.order }),
          })
        )
      );
    }
  } catch (error) {
    console.error("Error reordering materials:", error);
    throw error;
  }
}
