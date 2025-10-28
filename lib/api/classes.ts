import {
  Class,
  ClassesApiResponse,
  ApiClass,
  CreateClassRequest,
  CreateClassResponse,
  DeleteClassResponse,
  UpdateClassRequest,
  UpdateClassResponse,
} from "@/types/class";
import { ApiError, handleApiError } from "@/lib/errors";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

// Helper to get auth token
async function getToken(): Promise<string | null> {
  if (typeof window !== "undefined") {
    // Client-side: get from localStorage
    return localStorage.getItem("auth_token");
  } else {
    // Server-side: get from cookies
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return cookieStore.get("auth_token")?.value || null;
  }
}

function transformApiClass(apiClass: ApiClass): Class {
  return {
    id: apiClass.id,
    title: apiClass.title,
    description: apiClass.description,
    coverImage: apiClass.coverImage,
    teacherId: apiClass.teacherId,
    teacherName: apiClass.teacher?.name || "Unknown Teacher",
    createdAt: apiClass.createdAt,
    updatedAt: apiClass.updatedAt,
    studentCount: apiClass._count?.students || 0,
  };
}

// DUMMY DATA - akan diganti dengan real API nanti
const DUMMY_CLASSES: Class[] = [
  {
    id: "1",
    title: "Matematika Dasar",
    description:
      "Kelas matematika untuk pemula yang mencakup operasi dasar, aljabar sederhana, dan geometri.",
    coverImage:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    teacherId: "teacher-1",
    teacherName: "Budi Santoso",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z",
    studentCount: 25,
  },
  {
    id: "2",
    title: "Bahasa Indonesia",
    description:
      "Mempelajari tata bahasa, menulis, dan membaca dengan baik dan benar.",
    coverImage:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
    teacherId: "teacher-1",
    teacherName: "Budi Santoso",
    createdAt: "2024-01-16T09:00:00Z",
    updatedAt: "2024-01-16T09:00:00Z",
    studentCount: 30,
  },
  {
    id: "3",
    title: "Sains Alam",
    description:
      "Eksplorasi fenomena alam, ekosistem, dan prinsip-prinsip sains dasar.",
    coverImage:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
    teacherId: "teacher-1",
    teacherName: "Budi Santoso",
    createdAt: "2024-01-17T10:00:00Z",
    updatedAt: "2024-01-17T10:00:00Z",
    studentCount: 22,
  },
  {
    id: "4",
    title: "Sejarah Indonesia",
    description:
      "Mempelajari sejarah Indonesia dari masa praaksara hingga modern.",
    coverImage:
      "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&q=80",
    teacherId: "teacher-1",
    teacherName: "Budi Santoso",
    createdAt: "2024-01-18T11:00:00Z",
    updatedAt: "2024-01-18T11:00:00Z",
    studentCount: 20,
  },
  {
    id: "5",
    title: "Pendidikan Kewarganegaraan",
    description: "Memahami hak dan kewajiban sebagai warga negara yang baik.",
    coverImage:
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80",
    teacherId: "teacher-1",
    teacherName: "Budi Santoso",
    createdAt: "2024-01-19T08:30:00Z",
    updatedAt: "2024-01-19T08:30:00Z",
    studentCount: 28,
  },
  {
    id: "6",
    title: "Bahasa Inggris",
    description:
      "Pembelajaran bahasa Inggris untuk komunikasi sehari-hari dan akademik.",
    coverImage:
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80",
    teacherId: "teacher-1",
    teacherName: "Budi Santoso",
    createdAt: "2024-01-20T09:00:00Z",
    updatedAt: "2024-01-20T09:00:00Z",
    studentCount: 32,
  },
  {
    id: "7",
    title: "Seni Budaya",
    description: "Mengeksplorasi seni tradisional dan modern Indonesia.",
    coverImage:
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
    teacherId: "teacher-1",
    teacherName: "Budi Santoso",
    createdAt: "2024-01-21T10:00:00Z",
    updatedAt: "2024-01-21T10:00:00Z",
    studentCount: 24,
  },
  {
    id: "8",
    title: "Pendidikan Jasmani",
    description: "Olahraga dan kesehatan untuk perkembangan fisik siswa.",
    coverImage:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    teacherId: "teacher-1",
    teacherName: "Budi Santoso",
    createdAt: "2024-01-22T08:00:00Z",
    updatedAt: "2024-01-22T08:00:00Z",
    studentCount: 35,
  },
  {
    id: "9",
    title: "Teknologi Informasi",
    description: "Dasar-dasar komputer dan pemrograman untuk siswa.",
    coverImage:
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80",
    teacherId: "teacher-1",
    teacherName: "Budi Santoso",
    createdAt: "2024-01-23T09:30:00Z",
    updatedAt: "2024-01-23T09:30:00Z",
    studentCount: 27,
  },
  {
    id: "10",
    title: "Fisika Dasar",
    description: "Memahami hukum-hukum fisika dan aplikasinya dalam kehidupan.",
    coverImage:
      "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80",
    teacherId: "teacher-1",
    teacherName: "Budi Santoso",
    createdAt: "2024-01-24T10:00:00Z",
    updatedAt: "2024-01-24T10:00:00Z",
    studentCount: 21,
  },
  {
    id: "11",
    title: "Kimia Dasar",
    description: "Mempelajari materi, senyawa, dan reaksi kimia.",
    coverImage:
      "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80",
    teacherId: "teacher-1",
    teacherName: "Budi Santoso",
    createdAt: "2024-01-25T08:30:00Z",
    updatedAt: "2024-01-25T08:30:00Z",
    studentCount: 23,
  },
  {
    id: "12",
    title: "Biologi",
    description: "Studi tentang makhluk hidup dan lingkungannya.",
    coverImage:
      "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80",
    teacherId: "teacher-1",
    teacherName: "Budi Santoso",
    createdAt: "2024-01-26T09:00:00Z",
    updatedAt: "2024-01-26T09:00:00Z",
    studentCount: 29,
  },
  {
    id: "13",
    title: "Geografi",
    description: "Mempelajari permukaan bumi dan fenomena geografis.",
    coverImage:
      "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&q=80",
    teacherId: "teacher-1",
    teacherName: "Budi Santoso",
    createdAt: "2024-01-27T10:30:00Z",
    updatedAt: "2024-01-27T10:30:00Z",
    studentCount: 26,
  },
  {
    id: "14",
    title: "Ekonomi",
    description: "Memahami sistem ekonomi dan keuangan.",
    coverImage:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
    teacherId: "teacher-1",
    teacherName: "Budi Santoso",
    createdAt: "2024-01-28T08:00:00Z",
    updatedAt: "2024-01-28T08:00:00Z",
    studentCount: 31,
  },
  {
    id: "15",
    title: "Sosiologi",
    description: "Studi tentang masyarakat dan interaksi sosial.",
    coverImage:
      "https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=800&q=80",
    teacherId: "teacher-1",
    teacherName: "Budi Santoso",
    createdAt: "2024-01-29T09:30:00Z",
    updatedAt: "2024-01-29T09:30:00Z",
    studentCount: 19,
  },
];

let dummyClasses = [...DUMMY_CLASSES];

export async function fetchClasses(
  page: number = 1,
  search?: string
): Promise<{
  classes: Class[];
  meta: ClassesApiResponse["meta"];
}> {
  // Simulasi delay network
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Return all classes if page is 1 and no search (for initial load)
  if (page === 1 && (!search || search.trim() === "")) {
    return {
      classes: [...dummyClasses],
      meta: {
        itemCount: dummyClasses.length,
        totalItems: dummyClasses.length,
        itemsPerPage: dummyClasses.length,
        totalPages: 1,
        currentPage: 1,
      },
    };
  }

  // Filter berdasarkan search
  let filteredClasses = [...dummyClasses];
  if (search && search.trim() !== "") {
    const searchLower = search.toLowerCase();
    filteredClasses = filteredClasses.filter(
      (cls) =>
        cls.title.toLowerCase().includes(searchLower) ||
        cls.description.toLowerCase().includes(searchLower)
    );
  }

  // Pagination
  const itemsPerPage = 6;
  const totalItems = filteredClasses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClasses = filteredClasses.slice(startIndex, endIndex);

  return {
    classes: paginatedClasses,
    meta: {
      itemCount: paginatedClasses.length,
      totalItems,
      itemsPerPage,
      totalPages,
      currentPage: page,
    },
  };
}

export async function createClass(data: CreateClassRequest): Promise<Class> {
  // Simulasi delay network
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Simulasi validasi
  if (!data.title || data.title.trim().length < 3) {
    throw new ApiError("Judul kelas harus minimal 3 karakter", 400);
  }
  if (!data.description || data.description.trim().length < 10) {
    throw new ApiError("Deskripsi kelas harus minimal 10 karakter", 400);
  }

  // Generate default cover jika tidak ada
  const defaultCovers = [
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&q=80",
  ];

  const newClass: Class = {
    id: `class-${Date.now()}`,
    title: data.title,
    description: data.description,
    coverImage: data.coverImage
      ? URL.createObjectURL(data.coverImage)
      : defaultCovers[Math.floor(Math.random() * defaultCovers.length)],
    teacherId: "teacher-1",
    teacherName: "Budi Santoso",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    studentCount: 0,
  };

  dummyClasses.unshift(newClass);
  return newClass;
}

export async function updateClass(
  id: string,
  data: UpdateClassRequest
): Promise<Class> {
  // Simulasi delay network
  await new Promise((resolve) => setTimeout(resolve, 800));

  const classIndex = dummyClasses.findIndex((cls) => cls.id === id);
  if (classIndex === -1) {
    throw new ApiError("Kelas tidak ditemukan", 404);
  }

  // Validasi
  if (data.title && data.title.trim().length < 3) {
    throw new ApiError("Judul kelas harus minimal 3 karakter", 400);
  }
  if (data.description && data.description.trim().length < 10) {
    throw new ApiError("Deskripsi kelas harus minimal 10 karakter", 400);
  }

  const updatedClass: Class = {
    ...dummyClasses[classIndex],
    ...(data.title && { title: data.title }),
    ...(data.description && { description: data.description }),
    ...(data.coverImage && {
      coverImage: URL.createObjectURL(data.coverImage),
    }),
    updatedAt: new Date().toISOString(),
  };

  dummyClasses[classIndex] = updatedClass;
  return updatedClass;
}

export async function deleteClass(id: string): Promise<void> {
  // Simulasi delay network
  await new Promise((resolve) => setTimeout(resolve, 600));

  const classIndex = dummyClasses.findIndex((cls) => cls.id === id);
  if (classIndex === -1) {
    throw new ApiError("Kelas tidak ditemukan", 404);
  }

  dummyClasses.splice(classIndex, 1);
}

export async function getClassById(id: string): Promise<Class> {
  // Simulasi delay network
  await new Promise((resolve) => setTimeout(resolve, 300));

  const foundClass = dummyClasses.find((cls) => cls.id === id);
  if (!foundClass) {
    throw new ApiError("Kelas tidak ditemukan", 404);
  }

  return foundClass;
}
