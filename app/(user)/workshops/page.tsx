"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useWorkshops } from "@/hooks/use-workshops";
import { useCategories } from "@/hooks/use-categories";
import { WorkshopCard } from "@/components/workshop/workshop-card";
import { WorkshopFormModal } from "@/components/workshop/workshop-form-modal";
import { WorkshopDeleteDialog } from "@/components/workshop/workshop-delete-dialog";
import { WorkshopParticipantsModal } from "@/components/workshop/workshop-participants-modal";
import { Workshop, WorkshopCategory, WorkshopType, WorkshopFormData } from "@/types/workshop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Plus,
  Sparkles,
  CalendarCheck,
  Compass,
  Video,
  MapPin,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { isWorkshopPast } from "@/lib/utils";

export default function WorkshopsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { categories: backendCategories } = useCategories();
  const {
    workshops,
    isLoading,
    createWorkshop,
    updateWorkshop,
    deleteWorkshop,
  } = useWorkshops();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Silakan login terlebih dahulu untuk mengakses fitur workshop");
      router.push("/login?from=/workshops");
    }
  }, [authLoading, isAuthenticated, router]);

  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [selectedType, setSelectedType] = useState<string>("Semua");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [workshopToEdit, setWorkshopToEdit] = useState<Workshop | null>(null);
  const [workshopToDelete, setWorkshopToDelete] = useState<Workshop | null>(null);
  const [workshopToViewParticipants, setWorkshopToViewParticipants] =
    useState<Workshop | null>(null);

  const isTeacher = user?.role?.toLowerCase() === "teacher";
  const isTeacherOrAdmin =
    isAuthenticated &&
    (isTeacher ||
      user?.role?.toLowerCase() === "admin" ||
      user?.role?.toLowerCase() === "superadmin");

  // Workshop yang belum lewat / akan berjalan
  const upcomingWorkshops = useMemo(() => {
    return workshops.filter((ws) => !isWorkshopPast(ws.date, ws.endTime));
  }, [workshops]);

  // Filtered workshops for "Semua Workshop" tab (hanya workshop yang akan berjalan)
  const filteredWorkshops = useMemo(() => {
    return upcomingWorkshops.filter((ws) => {
      const matchSearch =
        ws.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ws.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ws.instructorName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === "Semua" || ws.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchType =
        selectedType === "Semua" || ws.type === selectedType;

      return matchSearch && matchCategory && matchType;
    });
  }, [upcomingWorkshops, searchQuery, selectedCategory, selectedType]);

  // Filtered workshops for "Pendaftaran Saya" tab (untuk siswa/user umum)
  const myRegisteredWorkshops = useMemo(() => {
    if (!user) return [];
    return upcomingWorkshops.filter((ws) =>
      ws.participants.some(
        (p) => p.userId === user.id && p.status === "Terdaftar"
      )
    );
  }, [upcomingWorkshops, user]);

  // Workshop yang diampu oleh guru / admin untuk memantau pendaftaran
  const myInstructedWorkshops = useMemo(() => {
    if (!user) return [];
    return workshops.filter((ws) => {
      if (ws.instructorId && ws.instructorId === user.id) return true;
      if (
        ws.instructorName &&
        user.name &&
        ws.instructorName.trim().toLowerCase() === user.name.trim().toLowerCase()
      ) {
        return true;
      }
      return false;
    });
  }, [workshops, user]);

  const handleOpenCreateModal = () => {
    setWorkshopToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (ws: Workshop) => {
    setWorkshopToEdit(ws);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: WorkshopFormData) => {
    if (workshopToEdit) {
      const res = await updateWorkshop(workshopToEdit.id, data);
      if (res.success) {
        toast.success(res.message);
        setIsFormOpen(false);
      }
    } else {
      const res = await createWorkshop(data);
      if (res.success) {
        toast.success(res.message);
        setIsFormOpen(false);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (workshopToDelete) {
      const res = await deleteWorkshop(workshopToDelete.id);
      if (res.success) {
        toast.success(res.message);
        setWorkshopToDelete(null);
      }
    }
  };

  const formatCategoryLabel = (text: string) => {
    if (text.length > 18) {
      return `${text.slice(0, 15)}...`;
    }
    return text;
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-6 w-96 mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-2xl p-4 space-y-3">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-3">
            Program Eksplorasi & Pelatihan Alam
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Workshop & Praktik Lapangan
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-1 max-w-2xl">
            Ikuti kegiatan pembelajaran aplikatif, eksperimen sains alam, kewirausahaan hijau, dan kearifan lokal.
          </p>
        </div>

        {isTeacherOrAdmin && (
          <Button
            onClick={handleOpenCreateModal}
            size="lg"
            className="rounded-xl shadow-md gap-2 shrink-0 font-semibold"
          >
            <Plus className="h-5 w-5" />
            Buat Workshop Baru
          </Button>
        )}
      </div>

      {/* Tabs Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <TabsList className="grid grid-cols-2 w-full sm:w-auto p-1 bg-muted rounded-xl">
            <TabsTrigger
              value="all"
              className="rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2"
            >
              Semua Workshop ({upcomingWorkshops.length})
            </TabsTrigger>
            <TabsTrigger
              value={isTeacherOrAdmin ? "my-workshops" : "my-registrations"}
              className="rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2"
            >
              <CalendarCheck className="h-4 w-4" />
              {isTeacherOrAdmin
                ? `Workshop Saya (${myInstructedWorkshops.length})`
                : `Pendaftaran Saya (${myRegisteredWorkshops.length})`}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-card p-4 rounded-2xl border-2 shadow-xs">
          {/* Search Input: flex-1 min-w-0 agar fleksibel menyusut/melebar mengikuti sisa ruang */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Cari workshop berdasarkan judul, materi, atau instruktur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 h-11 w-full border-muted-foreground/20 rounded-full bg-background text-sm focus-visible:ring-primary"
            />
          </div>

          {/* Filter Kategori: w-auto & max-w agar dinamis mengikuti isi teks */}
          <div className="w-full sm:w-auto shrink-0">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-11 w-full sm:w-auto min-w-[140px] max-w-[220px] rounded-xl border-muted-foreground/20 text-xs sm:text-sm font-medium gap-2">
                <SelectValue placeholder="Semua Kategori">
                  {selectedCategory === "Semua"
                    ? "Semua Kategori"
                    : formatCategoryLabel(selectedCategory)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Semua">Semua Kategori</SelectItem>
                {backendCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter Kegiatan/Tipe: jarak langsung gap-3 dari kategori */}
          <div className="w-full sm:w-auto shrink-0">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="h-11 w-full sm:w-auto min-w-[120px] rounded-xl border-muted-foreground/20 text-xs sm:text-sm font-medium gap-2">
                <SelectValue placeholder="Tipe Workshop" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Semua">Kegiatan</SelectItem>
                <SelectItem value="Offline">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-amber-600" />
                    Offline
                  </span>
                </SelectItem>
                <SelectItem value="Online">
                  <span className="flex items-center gap-1.5">
                    <Video className="h-3.5 w-3.5 text-blue-600" />
                    Online
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tab 1: Semua Workshop */}
        <TabsContent value="all" className="space-y-6 pt-2">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border rounded-2xl p-4 space-y-3">
                  <Skeleton className="aspect-video w-full rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredWorkshops.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-3xl bg-muted/20">
              <Compass className="h-12 w-12 mx-auto mb-3 text-muted-foreground/60" />
              <h3 className="text-lg font-bold">Tidak ada workshop ditemukan</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Coba sesuaikan kata kunci pencarian atau ganti filter kategori dan tipe kegiatan.
              </p>
              {(searchQuery || selectedCategory !== "Semua" || selectedType !== "Semua") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("Semua");
                    setSelectedType("Semua");
                  }}
                >
                  Reset Semua Filter
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredWorkshops.map((ws) => {
                const isReg =
                  !!user &&
                  ws.participants.some(
                    (p) => p.userId === user.id && p.status === "Terdaftar"
                  );
                return (
                  <WorkshopCard
                    key={ws.id}
                    workshop={ws}
                    isRegistered={isReg}
                    showAdminActions={isTeacherOrAdmin}
                    onEditClick={handleOpenEditModal}
                    onDeleteClick={(w) => setWorkshopToDelete(w)}
                    onParticipantsClick={(w) => setWorkshopToViewParticipants(w)}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Workshop Saya (Untuk Guru/Admin Memantau) ATAU Pendaftaran Saya (Untuk Siswa) */}
        {isTeacherOrAdmin ? (
          <TabsContent value="my-workshops" className="space-y-6 pt-2">
            {myInstructedWorkshops.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed rounded-3xl bg-muted/20">
                <Compass className="h-12 w-12 mx-auto mb-3 text-muted-foreground/60" />
                <h3 className="text-lg font-bold">Belum Ada Workshop yang Anda Ampu</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Anda belum memiliki workshop yang diampu. Buat workshop baru untuk mulai membuka pendaftaran dan memantau peserta kegiatan.
                </p>
                <Button className="mt-4 gap-2" onClick={handleOpenCreateModal}>
                  <Plus className="h-4 w-4" />
                  Buat Workshop Baru
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Pemantauan Workshop Saya</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Pantau pendaftaran peserta, ketersediaan kuota, serta kelola informasi kegiatan yang Anda ampu.
                    </p>
                  </div>
                  <Button
                    onClick={handleOpenCreateModal}
                    size="sm"
                    className="rounded-xl shrink-0 font-semibold gap-1.5 shadow-xs"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Workshop
                  </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {myInstructedWorkshops.map((ws) => (
                    <WorkshopCard
                      key={ws.id}
                      workshop={ws}
                      showAdminActions={true}
                      onEditClick={handleOpenEditModal}
                      onDeleteClick={(w) => setWorkshopToDelete(w)}
                      onParticipantsClick={(w) => setWorkshopToViewParticipants(w)}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        ) : (
          <TabsContent value="my-registrations" className="space-y-6 pt-2">
            {!isAuthenticated ? (
              <div className="text-center py-16 border-2 border-dashed rounded-3xl bg-muted/20">
                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/60" />
                <h3 className="text-lg font-bold">Login Diperlukan</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Silakan masuk dengan akun Anda untuk melihat workshop yang telah Anda ikuti.
                </p>
              </div>
            ) : myRegisteredWorkshops.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed rounded-3xl bg-muted/20">
                <CalendarCheck className="h-12 w-12 mx-auto mb-3 text-muted-foreground/60" />
                <h3 className="text-lg font-bold">Belum Ada Workshop Terdaftar</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Anda belum mendaftar ke workshop apa pun. Jelajahi daftar workshop yang tersedia dan mulai kembangkan keahlian Anda!
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setActiveTab("all")}
                >
                  Jelajahi Workshop
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {myRegisteredWorkshops.map((ws) => (
                  <WorkshopCard
                    key={ws.id}
                    workshop={ws}
                    isRegistered={true}
                    showAdminActions={false}
                    onEditClick={handleOpenEditModal}
                    onDeleteClick={(w) => setWorkshopToDelete(w)}
                    onParticipantsClick={(w) => setWorkshopToViewParticipants(w)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Modals */}
      <WorkshopFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        workshopToEdit={workshopToEdit}
        onSubmit={handleFormSubmit}
      />

      <WorkshopDeleteDialog
        open={!!workshopToDelete}
        onOpenChange={(open) => !open && setWorkshopToDelete(null)}
        workshop={workshopToDelete}
        onConfirm={handleConfirmDelete}
      />

      <WorkshopParticipantsModal
        open={!!workshopToViewParticipants}
        onOpenChange={(open) => !open && setWorkshopToViewParticipants(null)}
        workshop={workshopToViewParticipants}
      />
    </div>
  );
}
