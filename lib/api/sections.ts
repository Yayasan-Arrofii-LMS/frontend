import { ClassDetail, Section, Material } from "@/types/section";

// Dummy data untuk sections dan materials
const DUMMY_SECTIONS: Section[] = [
  {
    id: "section-1",
    title: "Pengenalan Dasar",
    description: "Memahami konsep dasar dan fundamental",
    order: 1,
    materials: [
      {
        id: "material-1",
        title: "Video Pengenalan",
        description: "Video pengenalan materi pembelajaran",
        type: "video",
        content: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        order: 1,
        createdAt: "2024-01-15T08:00:00Z",
        updatedAt: "2024-01-15T08:00:00Z",
      },
      {
        id: "material-2",
        title: "Materi Teori",
        description: "Penjelasan lengkap tentang teori dasar",
        type: "text",
        content:
          "Ini adalah konten teks lengkap tentang teori dasar yang perlu dipelajari. Materi ini mencakup berbagai aspek fundamental yang penting untuk dipahami sebelum melanjutkan ke materi berikutnya.",
        order: 2,
        createdAt: "2024-01-15T09:00:00Z",
        updatedAt: "2024-01-15T09:00:00Z",
      },
      {
        id: "material-3",
        title: "Diagram Konsep",
        description: "Visualisasi konsep dalam bentuk diagram",
        type: "image",
        content:
          "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&q=80",
        order: 3,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
    ],
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z",
  },
  {
    id: "section-2",
    title: "Materi Lanjutan",
    description: "Pembahasan mendalam dan praktik",
    order: 2,
    materials: [
      {
        id: "material-4",
        title: "Tutorial Praktik",
        description: "Video tutorial step by step",
        type: "video",
        content: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        order: 1,
        createdAt: "2024-01-16T08:00:00Z",
        updatedAt: "2024-01-16T08:00:00Z",
      },
      {
        id: "material-5",
        title: "Modul PDF",
        description: "Modul pembelajaran dalam format PDF",
        type: "document",
        content: "https://example.com/module.pdf",
        order: 2,
        createdAt: "2024-01-16T09:00:00Z",
        updatedAt: "2024-01-16T09:00:00Z",
      },
    ],
    createdAt: "2024-01-16T08:00:00Z",
    updatedAt: "2024-01-16T08:00:00Z",
  },
  {
    id: "section-3",
    title: "Evaluasi dan Latihan",
    description: "Soal-soal latihan dan evaluasi pemahaman",
    order: 3,
    materials: [],
    createdAt: "2024-01-17T08:00:00Z",
    updatedAt: "2024-01-17T08:00:00Z",
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchClassDetail(classId: string): Promise<ClassDetail> {
  await delay(800);

  const classDetail: ClassDetail = {
    id: classId,
    title: "Matematika Dasar",
    description:
      "Kelas matematika untuk pemula yang mencakup operasi dasar, aljabar sederhana, dan geometri.",
    coverImage:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    teacherId: "teacher-1",
    teacherName: "Budi Santoso",
    studentCount: 25,
    sections: [...DUMMY_SECTIONS],
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-17T08:00:00Z",
  };

  return classDetail;
}

export async function createSection(
  classId: string,
  data: { title: string; description?: string }
): Promise<Section> {
  await delay(500);

  const newSection: Section = {
    id: `section-${Date.now()}`,
    title: data.title,
    description: data.description,
    order: DUMMY_SECTIONS.length + 1,
    materials: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  DUMMY_SECTIONS.push(newSection);
  return newSection;
}

export async function updateSection(
  sectionId: string,
  data: { title: string; description?: string }
): Promise<Section> {
  await delay(500);

  const sectionIndex = DUMMY_SECTIONS.findIndex((s) => s.id === sectionId);
  if (sectionIndex === -1) {
    throw new Error("Section not found");
  }

  DUMMY_SECTIONS[sectionIndex] = {
    ...DUMMY_SECTIONS[sectionIndex],
    title: data.title,
    description: data.description,
    updatedAt: new Date().toISOString(),
  };

  return DUMMY_SECTIONS[sectionIndex];
}

export async function deleteSection(sectionId: string): Promise<void> {
  await delay(500);

  const sectionIndex = DUMMY_SECTIONS.findIndex((s) => s.id === sectionId);
  if (sectionIndex === -1) {
    throw new Error("Section not found");
  }

  DUMMY_SECTIONS.splice(sectionIndex, 1);
}

export async function createMaterial(
  sectionId: string,
  data: {
    title: string;
    description: string;
    type: Material["type"];
    content: string;
    youtubeUrl?: string;
  }
): Promise<Material> {
  await delay(500);

  const section = DUMMY_SECTIONS.find((s) => s.id === sectionId);
  if (!section) {
    throw new Error("Section not found");
  }

  const newMaterial: Material = {
    id: `material-${Date.now()}`,
    title: data.title,
    description: data.description,
    type: data.type,
    content: data.content,
    youtubeUrl: data.youtubeUrl,
    order: section.materials.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  section.materials.push(newMaterial);
  return newMaterial;
}

export async function updateMaterial(
  materialId: string,
  data: {
    title: string;
    description: string;
    type: Material["type"];
    content: string;
    youtubeUrl?: string;
  }
): Promise<Material> {
  await delay(500);

  for (const section of DUMMY_SECTIONS) {
    const materialIndex = section.materials.findIndex(
      (m: Material) => m.id === materialId
    );
    if (materialIndex !== -1) {
      section.materials[materialIndex] = {
        ...section.materials[materialIndex],
        title: data.title,
        description: data.description,
        type: data.type,
        content: data.content,
        youtubeUrl: data.youtubeUrl,
        updatedAt: new Date().toISOString(),
      };
      return section.materials[materialIndex];
    }
  }

  throw new Error("Material not found");
}

export async function deleteMaterial(materialId: string): Promise<void> {
  await delay(500);

  for (const section of DUMMY_SECTIONS) {
    const materialIndex = section.materials.findIndex(
      (m: Material) => m.id === materialId
    );
    if (materialIndex !== -1) {
      section.materials.splice(materialIndex, 1);
      return;
    }
  }

  throw new Error("Material not found");
}

export async function reorderSections(sectionIds: string[]): Promise<void> {
  await delay(300);

  // Update order based on new position
  const reorderedSections = sectionIds.map((id, index) => {
    const section = DUMMY_SECTIONS.find((s) => s.id === id);
    if (!section) throw new Error(`Section ${id} not found`);
    return { ...section, order: index + 1 };
  });

  // Replace array with reordered sections
  DUMMY_SECTIONS.length = 0;
  DUMMY_SECTIONS.push(...reorderedSections);
}

export async function reorderMaterials(
  sectionId: string,
  materialIds: string[]
): Promise<void> {
  await delay(300);

  const section = DUMMY_SECTIONS.find((s) => s.id === sectionId);
  if (!section) throw new Error("Section not found");

  // Update order based on new position
  const reorderedMaterials = materialIds.map((id, index) => {
    const material = section.materials.find((m: Material) => m.id === id);
    if (!material) throw new Error(`Material ${id} not found`);
    return { ...material, order: index + 1 };
  });

  // Replace materials array with reordered materials
  section.materials = reorderedMaterials;
}
