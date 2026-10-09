"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWorkshops } from "@/hooks/use-workshops";
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

export default function WorkshopsPage() {
  const { user, isAuthenticated } = useAuth();
  const {
    workshops,
    isLoading,
    createWorkshop,
    updateWorkshop,
    deleteWorkshop,
  } = useWorkshops();

  const [activeTab, setActiveTab] = useState<"all" | "my-registrations">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [selectedType, setSelectedType] = useState<string>("Semua");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [workshopToEdit, setWorkshopToEdit] = useState<Workshop | null>(null);
  const [workshopToDelete, setWorkshopToDelete] = useState<Workshop | null>(null);
  const [workshopToViewParticipants, setWorkshopToViewParticipants] =
    useState<Workshop | null>(null);

  const isTeacherOrAdmin =
    isAuthenticated &&
    (user?.role?.toLowerCase() === "teacher" ||
      user?.role?.toLowerCase() === "admin" ||
      user?.role?.toLowerCase() === "superadmin");

  // Filtered workshops for "Semua Workshop" tab
  const filteredWorkshops = useMemo(() => {
    return workshops.filter((ws) => {
      const matchSearch =
        ws.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ws.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ws.instructorName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === "Semua" || ws.category === selectedCategory;

      const matchType =
        selectedType === "Semua" || ws.type === selectedType;

      return matchSearch && matchCategory && matchType;
    });
  }, [workshops, searchQuery, selectedCategory, selectedType]);

  // Filtered workshops for "Pendaftaran Saya" tab
  const myRegisteredWorkshops = useMemo(() => {
    if (!user) return [];
    return workshops.filter((ws) =>
      ws.participants.some(
        (p) => p.userId === user.id && p.status === "Terdaftar"
      )
    );
  }, [workshops, user]);

  const handleOpenCreateModal = () => {
    setWorkshopToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (ws: Workshop) => {
    setWorkshopToEdit(ws);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: WorkshopFormData) => {
    if (workshopToEdit) {
      updateWorkshop(workshopToEdit.id, data);
      toast.success("Workshop berhasil diperbarui!");
    } else {
      createWorkshop(data, {
        id: user?.id || "inst-me",
        name: user?.name || "Guru Sekolah Alam",
        avatar: user?.profilePicture || null,
        bio: "Pengajar & Instruktur Workshop",
      });
      toast.success("Workshop baru berhasil dibuat!");
    }
  };

  const handleConfirmDelete = () => {
    if (workshopToDelete) {
      deleteWorkshop(workshopToDelete.id);
      toast.success("Workshop telah berhasil dihapus.");
      setWorkshopToDelete(null);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-3">
            <Compass className="h-3.5 w-3.5" />
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
        onValueChange={(val) => setActiveTab(val as "all" | "my-registrations")}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <TabsList className="grid grid-cols-2 w-full sm:w-auto p-1 bg-muted rounded-xl">
            <TabsTrigger
              value="all"
              className="rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Semua Workshop ({workshops.length})
            </TabsTrigger>
            <TabsTrigger
              value="my-registrations"
              className="rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2"
            >
              <CalendarCheck className="h-4 w-4" />
              Pendaftaran Saya ({myRegisteredWorkshops.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Filter Bar (Only shown on 'all' tab or both) */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-card p-4 rounded-2xl border-2 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari workshop berdasarkan judul, materi, atau instruktur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-muted-foreground/20 rounded-xl bg-background text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
            {/* Category Filter */}
            <div className="w-full sm:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-11 rounded-xl border-muted-foreground/20 text-xs sm:text-sm font-medium">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua Kategori</SelectItem>
                  <SelectItem value="Sains Alam">Sains Alam</SelectItem>
                  <SelectItem value="Keterampilan Hidup">Keterampilan Hidup</SelectItem>
                  <SelectItem value="Kewirausahaan">Kewirausahaan</SelectItem>
                  <SelectItem value="Budaya">Budaya</SelectItem>
                  <SelectItem value="Teknologi & Lingkungan">Teknologi & Lingkungan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="w-full sm:w-40">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-11 rounded-xl border-muted-foreground/20 text-xs sm:text-sm font-medium">
                  <SelectValue placeholder="Tipe Workshop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua Format</SelectItem>
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

        {/* Tab 2: Pendaftaran Saya */}
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
                  showAdminActions={isTeacherOrAdmin}
                  onEditClick={handleOpenEditModal}
                  onDeleteClick={(w) => setWorkshopToDelete(w)}
                  onParticipantsClick={(w) => setWorkshopToViewParticipants(w)}
                />
              ))}
            </div>
          )}
        </TabsContent>
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
