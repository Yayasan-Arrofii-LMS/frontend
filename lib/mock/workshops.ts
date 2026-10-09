import { Workshop, Participant, WorkshopFormData } from "@/types/workshop";

const STORAGE_KEY = "sekolah_alam_workshops_data";

export const INITIAL_WORKSHOPS: Workshop[] = [
  {
    id: "ws-1",
    title: "Eksplorasi Botani: Mengenal Flora Endemik Hutan Tropis",
    description:
      "Kegiatan praktik lapangan langsung di alam terbuka untuk mempelajari keanekaragaman flora lokal, teknik identifikasi tanaman obat keluarga, dan pembuatan herbarium sederhana yang menyenangkan.",
    thumbnail: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    category: "Sains Alam",
    date: "2026-10-24",
    startTime: "08:30",
    endTime: "12:00",
    type: "Offline",
    location: "Kebun Percobaan Sekolah Alam, Zona Hutan Mini",
    quota: 25,
    registeredCount: 18,
    instructorId: "inst-1",
    instructorName: "Budi Santoso, S.Si.",
    instructorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    instructorBio: "Guru Biologi & Pembina Komunitas Pecinta Alam",
    status: "Upcoming",
    participants: [
      {
        id: "p-1",
        userId: "user-101",
        userName: "Ahmad Fauzi",
        userEmail: "ahmad.fauzi@student.sekolahalam.sch.id",
        registrationDate: "2026-10-05T09:15:00Z",
        status: "Terdaftar",
      },
      {
        id: "p-2",
        userId: "user-102",
        userName: "Siti Rahma",
        userEmail: "siti.rahma@student.sekolahalam.sch.id",
        registrationDate: "2026-10-06T14:20:00Z",
        status: "Terdaftar",
      },
    ],
    createdAt: "2026-10-01T08:00:00Z",
    updatedAt: "2026-10-01T08:00:00Z",
  },
  {
    id: "ws-2",
    title: "Urban Farming & Hidroponik Ramah Lingkungan untuk Pemula",
    description:
      "Pelatihan interaktif via Zoom mengenai pembuatan instalasi hidroponik dari bahan daur ulang, nutrisi tanaman alami, dan teknik panen sayuran sehat di pekarangan rumah.",
    thumbnail: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
    category: "Keterampilan Hidup",
    date: "2026-10-28",
    startTime: "13:30",
    endTime: "16:00",
    type: "Online",
    meetingLink: "https://zoom.us/j/9876543210?pwd=SekolahAlamWorkshop",
    quota: 50,
    registeredCount: 42,
    instructorId: "inst-2",
    instructorName: "Dewi Lestari, S.P.",
    instructorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    instructorBio: "Praktisi Urban Agriculture & Pegiat Kompos Mandiri",
    status: "Upcoming",
    participants: [
      {
        id: "p-3",
        userId: "user-103",
        userName: "Rian Prasetya",
        userEmail: "rian.p@student.sekolahalam.sch.id",
        registrationDate: "2026-10-07T10:10:00Z",
        status: "Terdaftar",
      },
    ],
    createdAt: "2026-10-02T10:00:00Z",
    updatedAt: "2026-10-02T10:00:00Z",
  },
  {
    id: "ws-3",
    title: "Kewirausahaan Hijau: Mengolah Limbah Organik Menjadi Eco-Enzyme Bernilai Jual",
    description:
      "Workshop intensif mengubah kulit buah dan sisa sayur menjadi cairan serbaguna ramah lingkungan serta strategi pengemasan dan pemasaran produk bernilai ekonomi tinggi.",
    thumbnail: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
    category: "Kewirausahaan",
    date: "2026-11-02",
    startTime: "09:00",
    endTime: "12:30",
    type: "Offline",
    location: "Aula Serbaguna Gedung Hijau Lantai 1",
    quota: 30,
    registeredCount: 30, // Kuota Penuh
    instructorId: "inst-3",
    instructorName: "Hendra Wijaya, M.M.",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    instructorBio: "Mentor Kewirausahaan Sosial & Konsultan Lingkungan",
    status: "Upcoming",
    participants: [
      {
        id: "p-4",
        userId: "user-104",
        userName: "Nadia Utami",
        userEmail: "nadia.u@student.sekolahalam.sch.id",
        registrationDate: "2026-10-04T11:00:00Z",
        status: "Terdaftar",
      },
    ],
    createdAt: "2026-10-03T09:00:00Z",
    updatedAt: "2026-10-03T09:00:00Z",
  },
  {
    id: "ws-4",
    title: "Seni Anyaman Bambu Tradisional & Pelestarian Budaya Nusantara",
    description:
      "Mengenal filosofi, motif, dan praktik langsung membuat kerajinan anyaman bambu khas kearifan lokal bersama pengrajin tradisional berpengalaman.",
    thumbnail: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
    category: "Budaya",
    date: "2026-11-07",
    startTime: "08:00",
    endTime: "11:30",
    type: "Offline",
    location: "Pendopo Budaya Sekolah Alam",
    quota: 20,
    registeredCount: 8,
    instructorId: "inst-4",
    instructorName: "Ki Joko Suryo",
    instructorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    instructorBio: "Maestro Kerajinan Tradisional & Pelestari Seni Bambu",
    status: "Upcoming",
    participants: [],
    createdAt: "2026-10-04T13:00:00Z",
    updatedAt: "2026-10-04T13:00:00Z",
  },
  {
    id: "ws-5",
    title: "Teknologi IoT Sederhana untuk Monitoring Cuaca dan Kualitas Tanah",
    description:
      "Pelatihan online membangun stasiun cuaca mini dan alat pengukur kelembaban tanah menggunakan microcontroller Arduino dan sensor lingkungan berbiaya hemat.",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    category: "Teknologi & Lingkungan",
    date: "2026-11-12",
    startTime: "14:00",
    endTime: "17:00",
    type: "Online",
    meetingLink: "https://meet.google.com/xyz-alam-tech",
    quota: 40,
    registeredCount: 15,
    instructorId: "inst-1",
    instructorName: "Budi Santoso, S.Si.",
    instructorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    instructorBio: "Guru Biologi & Pembina Komunitas Pecinta Alam",
    status: "Upcoming",
    participants: [],
    createdAt: "2026-10-05T08:00:00Z",
    updatedAt: "2026-10-05T08:00:00Z",
  },
  {
    id: "ws-6",
    title: "Survival & Pertolongan Pertama Gawat Darurat (PPGD) di Alam Bebas",
    description:
      "Pelatihan komprehensif penanganan medis darurat, navigasi darat kompas bidik, teknik membuat bivak darurat, dan teknik pemurnian air minum saat berkegiatan di hutan.",
    thumbnail: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
    category: "Keterampilan Hidup",
    date: "2026-11-18",
    startTime: "07:30",
    endTime: "14:00",
    type: "Offline",
    location: "Camping Ground & Area Outbound Sekolah Alam",
    quota: 35,
    registeredCount: 35, // Kuota Penuh
    instructorId: "inst-5",
    instructorName: "Kapten (Purn) Suryanto",
    instructorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    instructorBio: "Instruktur SAR & Survival Tingkat Nasional",
    status: "Upcoming",
    participants: [
      {
        id: "p-5",
        userId: "user-105",
        userName: "Dimas Ardiansyah",
        userEmail: "dimas.a@student.sekolahalam.sch.id",
        registrationDate: "2026-10-04T12:00:00Z",
        status: "Terdaftar",
      },
    ],
    createdAt: "2026-10-05T11:00:00Z",
    updatedAt: "2026-10-05T11:00:00Z",
  },
];

// Helper to notify all listeners that workshop data has changed
function dispatchWorkshopChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("workshop-data-changed"));
  }
}

// Storage Operations
export function getStoredWorkshops(): Workshop[] {
  if (typeof window === "undefined") {
    return INITIAL_WORKSHOPS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_WORKSHOPS));
      return INITIAL_WORKSHOPS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Gagal membaca mock workshop dari localStorage:", err);
    return INITIAL_WORKSHOPS;
  }
}

export function saveStoredWorkshops(workshops: Workshop[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workshops));
    dispatchWorkshopChange();
  } catch (err) {
    console.error("Gagal menyimpan mock workshop ke localStorage:", err);
  }
}

export function getWorkshopById(id: string): Workshop | null {
  const workshops = getStoredWorkshops();
  return workshops.find((w) => w.id === id) || null;
}

export function createWorkshop(
  formData: WorkshopFormData,
  instructor: { id: string; name: string; avatar?: string | null; bio?: string }
): Workshop {
  const workshops = getStoredWorkshops();
  const now = new Date().toISOString();
  
  const newWorkshop: Workshop = {
    id: `ws-${Date.now()}`,
    ...formData,
    registeredCount: 0,
    instructorId: instructor.id,
    instructorName: instructor.name,
    instructorAvatar: instructor.avatar || null,
    instructorBio: instructor.bio || "Guru / Instruktur Sekolah Alam",
    status: "Upcoming",
    participants: [],
    createdAt: now,
    updatedAt: now,
  };

  const updated = [newWorkshop, ...workshops];
  saveStoredWorkshops(updated);
  return newWorkshop;
}

export function updateWorkshop(
  id: string,
  formData: Partial<WorkshopFormData>
): Workshop | null {
  const workshops = getStoredWorkshops();
  const index = workshops.findIndex((w) => w.id === id);
  if (index === -1) return null;

  const existing = workshops[index];
  const updatedWorkshop: Workshop = {
    ...existing,
    ...formData,
    updatedAt: new Date().toISOString(),
  };

  workshops[index] = updatedWorkshop;
  saveStoredWorkshops(workshops);
  return updatedWorkshop;
}

export function deleteWorkshop(id: string): boolean {
  const workshops = getStoredWorkshops();
  const filtered = workshops.filter((w) => w.id !== id);
  if (filtered.length === workshops.length) return false;

  saveStoredWorkshops(filtered);
  return true;
}

export function registerWorkshop(
  workshopId: string,
  user: { id: string; name: string; email: string; avatar?: string | null }
): { success: boolean; message: string; workshop?: Workshop } {
  const workshops = getStoredWorkshops();
  const workshop = workshops.find((w) => w.id === workshopId);

  if (!workshop) {
    return { success: false, message: "Workshop tidak ditemukan" };
  }

  // Cek apakah sudah terdaftar aktif
  const existingParticipant = workshop.participants.find(
    (p) => p.userId === user.id && p.status === "Terdaftar"
  );
  if (existingParticipant) {
    return { success: false, message: "Anda sudah terdaftar di workshop ini" };
  }

  // Cek kuota
  if (workshop.registeredCount >= workshop.quota) {
    return { success: false, message: "Pendaftaran gagal: Kuota workshop sudah penuh" };
  }

  const newParticipant: Participant = {
    id: `part-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userAvatar: user.avatar,
    registrationDate: new Date().toISOString(),
    status: "Terdaftar",
  };

  workshop.participants = [newParticipant, ...workshop.participants.filter((p) => p.userId !== user.id)];
  workshop.registeredCount += 1;
  workshop.updatedAt = new Date().toISOString();

  saveStoredWorkshops(workshops);
  return { success: true, message: "Selamat! Anda berhasil mendaftar ke workshop ini.", workshop };
}

export function cancelRegistration(
  workshopId: string,
  userId: string
): { success: boolean; message: string; workshop?: Workshop } {
  const workshops = getStoredWorkshops();
  const workshop = workshops.find((w) => w.id === workshopId);

  if (!workshop) {
    return { success: false, message: "Workshop tidak ditemukan" };
  }

  const participant = workshop.participants.find(
    (p) => p.userId === userId && p.status === "Terdaftar"
  );
  if (!participant) {
    return { success: false, message: "Pendaftaran tidak ditemukan atau sudah dibatalkan" };
  }

  participant.status = "Dibatalkan";
  workshop.registeredCount = Math.max(0, workshop.registeredCount - 1);
  workshop.updatedAt = new Date().toISOString();

  saveStoredWorkshops(workshops);
  return { success: true, message: "Pendaftaran workshop telah berhasil dibatalkan.", workshop };
}

export function getMyRegistrations(userId: string): { workshop: Workshop; registration: Participant }[] {
  const workshops = getStoredWorkshops();
  const results: { workshop: Workshop; registration: Participant }[] = [];

  for (const workshop of workshops) {
    const reg = workshop.participants.find((p) => p.userId === userId);
    if (reg) {
      results.push({ workshop, registration: reg });
    }
  }

  return results;
}
