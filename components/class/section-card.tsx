"use client";

import { useState, useEffect, useMemo, memo, useCallback } from "react";
import { Section, Material, QuizSummary, Quiz } from "@/types/section";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/optimized-dialog";
import {
  MoreVertical,
  Plus,
  Pencil,
  Trash2,
  FileText,
  GripVertical,
  Clock,
  ClipboardList,
} from "lucide-react";
import { EditSectionModal } from "@/components/class/edit-section-modal";
import { AddMaterialModal } from "@/components/class/add-material-modal";
import { EditMaterialModal } from "@/components/class/edit-material-modal";
import { AddQuizModal } from "@/components/class/add-quiz-modal";
import { EditQuizModal } from "@/components/class/edit-quiz-modal";
import { ManageQuestionsModal } from "@/components/class/manage-questions-modal";
import {
  deleteSection,
  deleteMaterial,
  reorderMaterials,
} from "@/lib/api/sections";
import { deleteQuiz, fetchQuizDetail } from "@/lib/api/quizzes";
import { toast } from "sonner";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

interface SectionCardProps {
  section: Section;
  sectionNumber: number;
  classId: string;
  basePath?: string;
  onUpdate: () => void;
  onDelete: () => void;
  triggerModalOpen?: {
    type: "addMaterial" | "editMaterial" | "addQuiz";
    sectionId: number;
    materialId?: number;
  } | null;
  onModalOpened?: () => void;
}

interface MaterialItemProps {
  material: Material;
  sectionId: number;
  onEdit: (material: Material) => void;
  onDelete: (materialId: number) => void;
}

interface QuizItemProps {
  quiz: QuizSummary;
  onEdit: (quizId: number) => void;
  onDelete: (quizId: number) => void;
  onManageQuestions: (quizId: number, quizTitle: string) => void;
}

const QuizItem = memo(function QuizItem({
  quiz,
  onEdit,
  onDelete,
  onManageQuestions,
}: QuizItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          <ClipboardList className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{quiz.title}</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {quiz.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Buka: {formatDate(quiz.open_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Tutup: {formatDate(quiz.close_at)}</span>
            </div>
          </div>
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManageQuestions(quiz.id, quiz.title)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Kelola Pertanyaan
            </Button>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(quiz.id)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Quiz
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(quiz.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus Quiz
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});

const MaterialItem = memo(function MaterialItem({
  material,
  sectionId,
  onEdit,
  onDelete,
}: MaterialItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: material.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-4 hover:bg-accent/50 transition-colors overflow-hidden ${
        isDragging ? "opacity-30" : "opacity-100"
      }`}
    >
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing mt-0.5 flex-shrink-0"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-0.5 flex-shrink-0">
            <FileText className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 min-w-0">
              <h4 className="font-medium flex-1 min-w-0 break-all line-clamp-1">
                {material.title}
              </h4>
              {material.xp && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded flex-shrink-0 whitespace-nowrap">
                  {material.xp} XP
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground break-all line-clamp-2">
              {material.content}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-2 flex-shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(material)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Materi
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(material.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus Materi
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});

export function SectionCard({
  section,
  sectionNumber,
  classId,
  basePath = "/course",
  onUpdate,
  onDelete,
  triggerModalOpen,
  onModalOpened,
}: SectionCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [isAddQuizOpen, setIsAddQuizOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editMaterialDefaultTab, setEditMaterialDefaultTab] = useState<
    "content" | "files"
  >("content");
  const [deletingMaterialId, setDeletingMaterialId] = useState<number | null>(
    null,
  );
  const [isDeletingMaterial, setIsDeletingMaterial] = useState(false);
  const [localMaterials, setLocalMaterials] = useState(section.Material);
  const [activeMaterial, setActiveMaterial] = useState<Material | null>(null);

  // Quiz states
  const [isEditQuizOpen, setIsEditQuizOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [deletingQuizId, setDeletingQuizId] = useState<number | null>(null);
  const [isDeletingQuiz, setIsDeletingQuiz] = useState(false);
  const [isManageQuestionsOpen, setIsManageQuestionsOpen] = useState(false);
  const [selectedQuizForQuestions, setSelectedQuizForQuestions] = useState<{
    quizId: number;
    quizTitle: string;
  } | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  // Sync localMaterials when section.Material changes (after CRUD operations)
  useEffect(() => {
    setLocalMaterials(section.Material);
  }, [section.Material]);

  // Listen for openEditMaterial event from AddMaterialModal
  useEffect(() => {
    const handleOpenEditMaterial = (event: Event) => {
      const customEvent = event as CustomEvent<{
        materialId: number;
        sectionId: number;
        openFilesTab?: boolean;
      }>;
      const { materialId, sectionId, openFilesTab } = customEvent.detail;

      // Only respond if it's for this section
      if (sectionId === section.id) {
        const material = section.Material.find((m) => m.id === materialId);
        if (material) {
          setEditMaterialDefaultTab(openFilesTab ? "files" : "content");
          setEditingMaterial(material);
        }
      }
    };

    window.addEventListener("openEditMaterial", handleOpenEditMaterial);
    return () => {
      window.removeEventListener("openEditMaterial", handleOpenEditMaterial);
    };
  }, [section.id, section.Material]);

  // Handle trigger modal open from URL params
  useEffect(() => {
    if (triggerModalOpen) {
      if (triggerModalOpen.type === "addMaterial") {
        setIsAddMaterialOpen(true);
      } else if (triggerModalOpen.type === "addQuiz") {
        setIsAddQuizOpen(true);
      } else if (
        triggerModalOpen.type === "editMaterial" &&
        triggerModalOpen.materialId
      ) {
        const material = section.Material.find(
          (m) => m.id === triggerModalOpen.materialId,
        );
        if (material) {
          setEditingMaterial(material);
        }
      }
      onModalOpened?.();
    }
  }, [triggerModalOpen, section.Material, onModalOpened]);

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [transform, transition],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await deleteSection(classId, section.id);
      onDelete();
      setIsDeleteOpen(false);
    } catch {
      toast.error("Gagal menghapus section");
    } finally {
      setIsDeleting(false);
    }
  }, [classId, section.id, onDelete]);

  const handleDeleteMaterial = useCallback(
    async (materialId: number) => {
      setIsDeletingMaterial(true);
      try {
        await deleteMaterial(classId, section.id, materialId);
        toast.success("Materi berhasil dihapus");
        onUpdate();
        setDeletingMaterialId(null);
      } catch {
        toast.error("Gagal menghapus materi");
      } finally {
        setIsDeletingMaterial(false);
      }
    },
    [classId, section.id, onUpdate],
  );

  const handleEditQuiz = useCallback(
    async (quizId: number) => {
      try {
        // Fetch full quiz detail from API including questions and answers
        const quizData = await fetchQuizDetail(section.id, quizId);
        setEditingQuiz(quizData);
        setIsEditQuizOpen(true);
      } catch (error) {
        toast.error("Gagal memuat data quiz");
        console.error("Kesalahan saat memuat quiz:", error);
      }
    },
    [section.id],
  );

  const handleDeleteQuiz = useCallback(
    async (quizId: number) => {
      setIsDeletingQuiz(true);
      try {
        await deleteQuiz(section.id, quizId);
        toast.success("Quiz berhasil dihapus");
        onUpdate();
        setDeletingQuizId(null);
      } catch {
        toast.error("Gagal menghapus quiz");
      } finally {
        setIsDeletingQuiz(false);
      }
    },
    [section.id, onUpdate],
  );

  const handleManageQuestions = useCallback(
    (quizId: number, quizTitle: string) => {
      setSelectedQuizForQuestions({ quizId, quizTitle });
      setIsManageQuestionsOpen(true);
    },
    [],
  );

  const handleMaterialDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const material = localMaterials.find((m) => m.id === active.id);
      if (material) {
        setActiveMaterial(material);
      }
    },
    [localMaterials],
  );

  const handleMaterialDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveMaterial(null);

      if (!over) return;

      if (active.id !== over.id) {
        const oldIndex = localMaterials.findIndex((m) => m.id === active.id);
        const newIndex = localMaterials.findIndex((m) => m.id === over.id);

        const newMaterials = arrayMove(localMaterials, oldIndex, newIndex);

        // Store original orders before update
        const originalOrders = localMaterials.map((m, index) => ({
          id: m.id,
          order: index + 1,
        }));

        // Update UI immediately
        setLocalMaterials(newMaterials);

        try {
          // Save to backend with new order (only changed materials will be updated)
          const materialOrders = newMaterials.map((m, index) => ({
            id: m.id,
            order: index + 1,
          }));
          await reorderMaterials(
            classId,
            section.id,
            materialOrders,
            originalOrders,
          );
          toast.success("Urutan materi berhasil diubah");
          // Don't call onUpdate() to avoid re-fetching and skeleton loading
        } catch {
          // Revert on error
          toast.error("Gagal mengubah urutan materi");
          setLocalMaterials(section.Material);
        }
      }
    },
    [localMaterials, classId, section.id, section.Material],
  );

  const materialIds = useMemo(
    () => localMaterials.map((m) => m.id),
    [localMaterials],
  );

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={isDragging ? "opacity-30" : "opacity-100"}
      >
        <CardHeader className="pb-4 overflow-hidden">
          <div className="flex items-start justify-between gap-2 min-w-0">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing mt-1 flex-shrink-0"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    Section {sectionNumber}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-1 break-all line-clamp-1">
                  {section.title}
                </h3>
                {section.description && (
                  <p className="text-sm text-muted-foreground break-all line-clamp-2">
                    {section.description}
                  </p>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Section
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Section
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 overflow-hidden">
          {/* Materials and Quizzes List */}
          {section.Material.length === 0 && section.Quiz.length === 0 ? (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-4">
                Belum ada materi atau quiz di section ini
              </p>
              <div className="flex gap-2 justify-center">
                <Button size="sm" onClick={() => setIsAddMaterialOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Materi
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddQuizOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Quiz
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Materials List with Drag and Drop */}
              {section.Material.length > 0 && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleMaterialDragStart}
                  onDragEnd={handleMaterialDragEnd}
                >
                  <SortableContext
                    items={materialIds}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {localMaterials.map((material) => (
                        <MaterialItem
                          key={material.id}
                          material={material}
                          sectionId={section.id}
                          onEdit={setEditingMaterial}
                          onDelete={setDeletingMaterialId}
                        />
                      ))}
                    </div>
                  </SortableContext>
                  <DragOverlay>
                    {activeMaterial ? (
                      <div className="border rounded-lg p-4 bg-background shadow-lg w-full max-w-2xl overflow-hidden">
                        <div className="flex items-start gap-3 min-w-0">
                          <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="mt-0.5 flex-shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 min-w-0">
                              <h4 className="font-medium flex-1 min-w-0 break-all line-clamp-1">
                                {activeMaterial.title}
                              </h4>
                              {activeMaterial.xp && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded flex-shrink-0 whitespace-nowrap">
                                  {activeMaterial.xp} XP
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground break-all line-clamp-2">
                              {activeMaterial.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}

              {/* Quizzes List */}
              {section.Quiz.length > 0 && (
                <div
                  className={`space-y-3 ${
                    section.Material.length > 0 ? "mt-3" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <ClipboardList className="h-4 w-4" />
                    <span>Quiz</span>
                  </div>
                  {section.Quiz.map((quiz) => (
                    <QuizItem
                      key={quiz.id}
                      quiz={quiz}
                      onEdit={handleEditQuiz}
                      onDelete={setDeletingQuizId}
                      onManageQuestions={handleManageQuestions}
                    />
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setIsAddMaterialOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Materi
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setIsAddQuizOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Quiz
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Section Modal */}
      <EditSectionModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUpdate={onUpdate}
        classId={classId}
        section={section}
      />

      {/* Delete Section Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Section?</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus section &quot;{section.title}
              &quot;? Semua materi di dalam section ini juga akan dihapus.
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Material Modal */}
      <AddMaterialModal
        isOpen={isAddMaterialOpen}
        onClose={() => setIsAddMaterialOpen(false)}
        onAdd={onUpdate}
        classId={classId}
        sectionId={section.id}
        basePath={basePath}
      />

      {/* Add Quiz Modal */}
      <AddQuizModal
        isOpen={isAddQuizOpen}
        onClose={() => setIsAddQuizOpen(false)}
        onAdd={onUpdate}
        classId={classId}
        sectionId={section.id}
        basePath={basePath}
      />

      {/* Edit Material Modal */}
      {editingMaterial && (
        <EditMaterialModal
          isOpen={true}
          onClose={() => {
            setEditingMaterial(null);
            setEditMaterialDefaultTab("content");
          }}
          onUpdate={onUpdate}
          classId={classId}
          sectionId={section.id}
          material={editingMaterial}
          basePath={basePath}
          defaultTab={editMaterialDefaultTab}
        />
      )}

      {/* Delete Material Dialog */}
      <Dialog
        open={deletingMaterialId !== null}
        onOpenChange={(open) => !open && setDeletingMaterialId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Materi?</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus materi ini? Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingMaterialId(null)}
              disabled={isDeletingMaterial}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deletingMaterialId && handleDeleteMaterial(deletingMaterialId)
              }
              disabled={isDeletingMaterial}
            >
              {isDeletingMaterial ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Quiz Modal */}
      <EditQuizModal
        isOpen={isEditQuizOpen}
        onClose={() => {
          setIsEditQuizOpen(false);
          setEditingQuiz(null);
        }}
        onUpdate={onUpdate}
        sectionId={section.id}
        quiz={editingQuiz}
      />

      {/* Delete Quiz Dialog */}
      <Dialog
        open={deletingQuizId !== null}
        onOpenChange={(open) => !open && setDeletingQuizId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Quiz?</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus quiz ini? Semua pertanyaan dan
              data terkait akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingQuizId(null)}
              disabled={isDeletingQuiz}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingQuizId && handleDeleteQuiz(deletingQuizId)}
              disabled={isDeletingQuiz}
            >
              {isDeletingQuiz ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Questions Modal */}
      {selectedQuizForQuestions && (
        <ManageQuestionsModal
          isOpen={isManageQuestionsOpen}
          onClose={() => {
            setIsManageQuestionsOpen(false);
            setSelectedQuizForQuestions(null);
          }}
          sectionId={section.id}
          quizId={selectedQuizForQuestions.quizId}
          quizTitle={selectedQuizForQuestions.quizTitle}
        />
      )}
    </>
  );
}
