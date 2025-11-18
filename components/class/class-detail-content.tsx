"use client";

import { useState, useEffect } from "react";
import NextImage from "next/image";
import { useSearchParams } from "next/navigation";
import { ClassDetail } from "@/types/section";
import { fetchClassDetail, reorderSections } from "@/lib/api/sections";
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/error-state";
import { SectionCard } from "@/components/class/section-card";
import { AddSectionModal } from "@/components/class/add-section-modal";
import { toast } from "sonner";
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
}

export function ClassDetailContent({ classId }: ClassDetailContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [triggerModalOpen, setTriggerModalOpen] = useState<{
    type: "addMaterial" | "editMaterial" | "addQuiz";
    sectionId: number;
    materialId?: number;
  } | null>(null);

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
    
    if (openAddMaterial && sectionIdParam) {
      setTriggerModalOpen({
        type: "addMaterial",
        sectionId: parseInt(sectionIdParam),
      });
      // Clean URL
      router.replace(`/class/${classId}`);
    } else if (openEditMaterial && sectionIdParam) {
      setTriggerModalOpen({
        type: "editMaterial",
        sectionId: parseInt(sectionIdParam),
        materialId: parseInt(openEditMaterial),
      });
      router.replace(`/class/${classId}`);
    } else if (openAddQuiz && sectionIdParam) {
      setTriggerModalOpen({
        type: "addQuiz",
        sectionId: parseInt(sectionIdParam),
      });
      router.replace(`/class/${classId}`);
    }
  }, [searchParams, classId, router]);

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
          onClick={() => router.push("/class")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <div className="flex items-start gap-6 min-w-0">
          <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
            <NextImage
              src={classDetail.coverImage}
              alt={classDetail.title}
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold mb-2 break-all line-clamp-1">{classDetail.title}</h1>
            <p className="text-muted-foreground mb-4 break-all line-clamp-2">{classDetail.description}</p>
            <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="break-all">Guru: {classDetail.teacherName}</span>
              <span>•</span>
              <span>{classDetail.studentCount} Siswa</span>
              <span>•</span>
              <span>{classDetail.sections.length} Section</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sections Header */}
      <div className="flex items-center justify-between mb-6">
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

      {/* Add Section Modal */}
      <AddSectionModal
        isOpen={isAddSectionOpen}
        onClose={() => setIsAddSectionOpen(false)}
        onAdd={handleSectionAdded}
        classId={classId}
      />
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
