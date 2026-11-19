"use client";

import { useState, useEffect } from "react";
import NextImage from "next/image";
import { ClassCoverImage } from "@/components/class/class-cover-image";
import { useSearchParams } from "next/navigation";
import { ClassDetail } from "@/types/section";
import { fetchClassDetail, reorderSections } from "@/lib/api/sections";
import {
  ArrowLeft,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  Check,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/error-state";
import { SectionCard } from "@/components/class/section-card";
import { AddSectionModal } from "@/components/class/add-section-modal";
import { StudentsTable } from "@/components/class/students-table";
import { ApplicantsTable } from "@/components/class/applicants-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { approveClass, rejectClass } from "@/lib/api/classes";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Section } from "@/types/section";

interface ClassDetailContentProps {
  classId: string;
  basePath?: string;
}

export function ClassDetailContent({ classId, basePath = "/course" }: ClassDetailContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [activeTab, setActiveTab] = useState<string>("content");
  const [triggerModalOpen, setTriggerModalOpen] = useState<{
    type: "addMaterial" | "editMaterial" | "addQuiz";
    sectionId: number;
    materialId?: number;
  } | null>(null);

  const { user } = useAuth();
  const [isProcessingApproval, setIsProcessingApproval] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [adminRejectionReason, setAdminRejectionReason] = useState("");

  const handleAdminApprove = async () => {
    if (!classDetail) return;
    try {
      setIsProcessingApproval(true);
      await approveClass(classDetail.id);
      toast.success("Kelas berhasil disetujui oleh Admin");
      await loadClassDetail();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyetujui kelas");
    } finally {
      setIsProcessingApproval(false);
    }
  };

  const handleAdminReject = async () => {
    if (!classDetail) return;
    try {
      setIsProcessingApproval(true);
      await rejectClass(classDetail.id, adminRejectionReason.trim() || undefined);
      toast.success("Kelas telah ditolak");
      setIsRejectDialogOpen(false);
      setAdminRejectionReason("");
      await loadClassDetail();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menolak kelas");
    } finally {
      setIsProcessingApproval(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadClassDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  useEffect(() => {
    // Check URL params to trigger modal open
    const openAddMaterial = searchParams.get("openAddMaterial");
    const openEditMaterial = searchParams.get("openEditMaterial");
    const openAddQuiz = searchParams.get("openAddQuiz");
    const sectionIdParam = searchParams.get("sectionId");

    if (openAddMaterial) {
      // openAddMaterial contains the sectionId value
      setTriggerModalOpen({
        type: "addMaterial",
        sectionId: parseInt(openAddMaterial),
      });
      // Clean URL
      router.replace(`${basePath}/${classId}`);
    } else if (openEditMaterial && sectionIdParam) {
      setTriggerModalOpen({
        type: "editMaterial",
        sectionId: parseInt(sectionIdParam),
        materialId: parseInt(openEditMaterial),
      });
      router.replace(`${basePath}/${classId}`);
    } else if (openAddQuiz) {
      // openAddQuiz contains the sectionId value
      setTriggerModalOpen({
        type: "addQuiz",
        sectionId: parseInt(openAddQuiz),
      });
      router.replace(`${basePath}/${classId}`);
    }
  }, [searchParams, classId, basePath, router]);

  const loadClassDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchClassDetail(classId);
      setClassDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat detail kelas");
      toast.error("Gagal memuat detail kelas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionAdded = () => {
    loadClassDetail();
    toast.success("Section berhasil ditambahkan");
  };

  const handleSectionUpdated = () => {
    loadClassDetail();
    toast.success("Section berhasil diperbarui");
  };

  const handleSectionDeleted = () => {
    loadClassDetail();
    toast.success("Section berhasil dihapus");
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (!classDetail) return;

    const section = classDetail.sections.find((s) => s.id === active.id);
    if (section) {
      setActiveSection(section);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveSection(null);

    if (!over || !classDetail) return;

    if (active.id !== over.id) {
      const sections = classDetail.sections;
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      const newSections = arrayMove(sections, oldIndex, newIndex);

      // Store original orders before update
      const originalOrders = sections.map((s, index) => ({
        id: s.id,
        order: index + 1,
      }));

      // Update UI immediately
      setClassDetail({
        ...classDetail,
        sections: newSections,
      });

      try {
        // Save to backend with new order (only changed sections will be updated)
        const sectionOrders = newSections.map((s, index) => ({
          id: s.id,
          order: index + 1,
        }));
        await reorderSections(classId, sectionOrders, originalOrders);
        toast.success("Urutan section berhasil diubah");
      } catch {
        // Revert on error
        toast.error("Gagal mengubah urutan section");
        loadClassDetail();
      }
    }
  };

  if (isLoading) {
    return <ClassDetailSkeleton />;
  }

  if (error || !classDetail) {
    return <ErrorState message={error || "Data tidak ditemukan"} onRetry={loadClassDetail} />;
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6 overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(basePath)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <div className="flex items-start gap-6 min-w-0">
          <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
            <ClassCoverImage
              src={classDetail.coverImage}
              alt={classDetail.title}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl font-bold break-all line-clamp-1">{classDetail.title}</h1>
              {classDetail.category && (
                <Badge variant="secondary" className="font-medium text-xs">
                  {typeof classDetail.category === "object" ? classDetail.category.name : classDetail.category}
                </Badge>
              )}
              {classDetail.registrationType === "MANUAL" ? (
                <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">
                  Persetujuan Guru
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30">
                  Pendaftaran Terbuka
                </Badge>
              )}
              {classDetail.approvalStatus === "PENDING" && (
                <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Menunggu Persetujuan Admin
                </Badge>
              )}
              {classDetail.approvalStatus === "APPROVED" && (
                <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Disetujui Admin
                </Badge>
              )}
              {classDetail.approvalStatus === "REJECTED" && (
                <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/30 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Ditolak Admin
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mb-4 break-all line-clamp-2">{classDetail.description}</p>
            <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="break-all">Guru: {classDetail.teacherName}</span>
              <span>&bull;</span>
              <span>{classDetail.studentCount} Siswa</span>
              <span>&bull;</span>
              <span>{classDetail.sections.length} Section</span>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Status Banners */}
      {classDetail.approvalStatus === "REJECTED" && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-destructive flex items-start gap-3 mb-6">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Kelas Ditolak oleh Admin</h4>
            <p className="text-sm text-destructive/90">
              {classDetail.rejectionReason
                ? `Alasan penolakan: "${classDetail.rejectionReason}"`
                : "Kelas ini ditolak oleh Admin dan saat ini tidak dapat diakses atau didaftarkan oleh siswa."}
            </p>
          </div>
        </div>
      )}

      {classDetail.approvalStatus === "PENDING" && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-700 dark:text-amber-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">Menunggu Persetujuan Admin</h4>
              <p className="text-sm text-amber-700/90 dark:text-amber-300/90">
                {user?.role === "Admin"
                  ? "Kelas ini diajukan oleh Guru dan memerlukan keputusan persetujuan Anda."
                  : "Kelas ini telah diajukan dan sedang menunggu peninjauan oleh Admin. Setelah disetujui, kelas akan otomatis muncul di katalog dan dapat diikuti siswa."}
              </p>
            </div>
          </div>
          {user?.role === "Admin" && (
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                disabled={isProcessingApproval}
                onClick={handleAdminApprove}
              >
                {isProcessingApproval ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Setujui Kelas
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="text-xs h-8"
                disabled={isProcessingApproval}
                onClick={() => {
                  setAdminRejectionReason("");
                  setIsRejectDialogOpen(true);
                }}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Tolak Kelas
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="content">Konten</TabsTrigger>
          <TabsTrigger value="students">Siswa ({classDetail.students?.length || 0})</TabsTrigger>
          <TabsTrigger value="applicants">Pendaftar</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          {/* Sections Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Daftar Section</h2>
            <Button onClick={() => setIsAddSectionOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Section
            </Button>
          </div>

          {/* Sections List */}
          {classDetail.sections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Belum Ada Section</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Mulai tambahkan section untuk mengorganisir materi pembelajaran kelas ini.
            </p>
            <Button onClick={() => setIsAddSectionOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Section Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={classDetail.sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {classDetail.sections.map((section, index) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  sectionNumber={index + 1}
                  classId={classId}
                  basePath={basePath}
                  onUpdate={handleSectionUpdated}
                  onDelete={handleSectionDeleted}
                  triggerModalOpen={
                    triggerModalOpen?.sectionId === section.id
                      ? triggerModalOpen
                      : null
                  }
                  onModalOpened={() => setTriggerModalOpen(null)}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeSection ? (
              <Card className="shadow-lg w-full max-w-2xl overflow-hidden">
                <CardContent className="p-6 overflow-hidden">
                  <div className="flex items-start gap-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Section {classDetail.sections.findIndex((s) => s.id === activeSection.id) + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-1 break-all line-clamp-1">{activeSection.title}</h3>
                  {activeSection.description && (
                    <p className="text-sm text-muted-foreground break-all line-clamp-2">{activeSection.description}</p>
                  )}
                  <div className="mt-3 text-sm text-muted-foreground">
                    {activeSection.Material.length} Materi
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
        </TabsContent>

        <TabsContent value="students">
          <StudentsTable students={classDetail.students || []} />
        </TabsContent>

        <TabsContent value="applicants">
          <ApplicantsTable classId={classId} onStatusChanged={loadClassDetail} />
        </TabsContent>
      </Tabs>

      {/* Add Section Modal */}
      <AddSectionModal
        isOpen={isAddSectionOpen}
        onClose={() => setIsAddSectionOpen(false)}
        onAdd={handleSectionAdded}
        classId={classId}
      />

      {/* Admin Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Tolak Persetujuan Kelas
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menolak kelas{" "}
              <span className="font-semibold text-foreground">
                "{classDetail.title}"
              </span>
              ? Berikan alasan penolakan agar Guru dapat memperbaiki kelas ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label className="text-sm font-medium">Alasan Penolakan (Opsional)</label>
            <Textarea
              placeholder="Contoh: Deskripsi kelas belum lengkap, materi belum memenuhi standar, dsb..."
              value={adminRejectionReason}
              onChange={(e) => setAdminRejectionReason(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {adminRejectionReason.length}/500 karakter
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={isProcessingApproval}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleAdminReject}
              disabled={isProcessingApproval}
            >
              {isProcessingApproval ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menolak...
                </>
              ) : (
                "Tolak Kelas"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ClassDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-10 w-32 mb-4" />
        <div className="flex items-start gap-6">
          <Skeleton className="w-32 h-32 rounded-lg" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-full max-w-2xl" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
      </div>

      {/* Sections Header Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Sections Skeleton */}
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full max-w-lg" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="space-y-3">
              {[...Array(2)].map((_, j) => (
                <Skeleton key={j} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
