"use client";

import { useState, useEffect } from "react";
import { Section, Material } from "@/types/section";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Plus, Pencil, Trash2, FileText, Video, Image as ImageIcon, FileIcon, GripVertical } from "lucide-react";
import { EditSectionModal } from "@/components/class/edit-section-modal";
import { AddMaterialModal } from "@/components/class/add-material-modal";
import { EditMaterialModal } from "@/components/class/edit-material-modal";
import { deleteSection, deleteMaterial, reorderMaterials } from "@/lib/api/sections";
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
  onUpdate: () => void;
  onDelete: () => void;
}

interface MaterialItemProps {
  material: Material;
  getMaterialIcon: (type: Material["type"]) => React.ReactNode;
  getMaterialTypeLabel: (type: Material["type"]) => string;
  onEdit: (material: Material) => void;
  onDelete: (materialId: string) => void;
}

function MaterialItem({
  material,
  getMaterialIcon,
  getMaterialTypeLabel,
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
      className={`border rounded-lg p-4 hover:bg-accent/50 transition-colors ${
        isDragging ? "opacity-30" : "opacity-100"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing mt-0.5"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-0.5">{getMaterialIcon(material.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium">{material.title}</h4>
              <span className="text-xs bg-muted px-2 py-0.5 rounded">
                {getMaterialTypeLabel(material.type)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {material.description}
            </p>
            {material.youtubeUrl && (
              <a
                href={material.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline mt-1 inline-block"
              >
                Lihat di YouTube
              </a>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-2">
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
}

export function SectionCard({
  section,
  sectionNumber,
  onUpdate,
  onDelete,
}: SectionCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deletingMaterialId, setDeletingMaterialId] = useState<string | null>(null);
  const [isDeletingMaterial, setIsDeletingMaterial] = useState(false);
  const [localMaterials, setLocalMaterials] = useState(section.materials);
  const [activeMaterial, setActiveMaterial] = useState<Material | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  // Sync localMaterials when section.materials changes (after CRUD operations)
  useEffect(() => {
    setLocalMaterials(section.materials);
  }, [section.materials]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteSection(section.id);
      onDelete();
      setIsDeleteOpen(false);
    } catch (error) {
      toast.error("Gagal menghapus section");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    setIsDeletingMaterial(true);
    try {
      await deleteMaterial(materialId);
      toast.success("Materi berhasil dihapus");
      onUpdate();
      setDeletingMaterialId(null);
    } catch (error) {
      toast.error("Gagal menghapus materi");
    } finally {
      setIsDeletingMaterial(false);
    }
  };

  const handleMaterialDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const material = localMaterials.find((m) => m.id === active.id);
    if (material) {
      setActiveMaterial(material);
    }
  };

  const handleMaterialDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveMaterial(null);

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = localMaterials.findIndex((m) => m.id === active.id);
      const newIndex = localMaterials.findIndex((m) => m.id === over.id);

      const newMaterials = arrayMove(localMaterials, oldIndex, newIndex);
      
      // Update UI immediately
      setLocalMaterials(newMaterials);

      try {
        // Save to backend
        await reorderMaterials(section.id, newMaterials.map((m) => m.id));
        toast.success("Urutan materi berhasil diubah");
        // Don't call onUpdate() to avoid re-fetching and skeleton loading
      } catch (error) {
        // Revert on error
        toast.error("Gagal mengubah urutan materi");
        setLocalMaterials(section.materials);
      }
    }
  };

  const getMaterialIcon = (type: Material["type"]) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "image":
        return <ImageIcon className="h-4 w-4" />;
      case "text":
        return <FileText className="h-4 w-4" />;
      case "document":
        return <FileIcon className="h-4 w-4" />;
    }
  };

  const getMaterialTypeLabel = (type: Material["type"]) => {
    switch (type) {
      case "video":
        return "Video";
      case "image":
        return "Gambar";
      case "text":
        return "Teks";
      case "document":
        return "Dokumen";
    }
  };

  return (
    <>
      <Card 
        ref={setNodeRef} 
        style={style}
        className={isDragging ? "opacity-30" : "opacity-100"}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing mt-1"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    Section {sectionNumber}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-1">{section.title}</h3>
                {section.description && (
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
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
        <CardContent className="space-y-4">
          {/* Materials List */}
          {section.materials.length === 0 ? (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-4">
                Belum ada materi di section ini
              </p>
              <Button size="sm" onClick={() => setIsAddMaterialOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Materi
              </Button>
            </div>
          ) : (
            <>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleMaterialDragStart}
                onDragEnd={handleMaterialDragEnd}
              >
                <SortableContext
                  items={localMaterials.map((m) => m.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {localMaterials.map((material) => (
                      <MaterialItem
                        key={material.id}
                        material={material}
                        getMaterialIcon={getMaterialIcon}
                        getMaterialTypeLabel={getMaterialTypeLabel}
                        onEdit={setEditingMaterial}
                        onDelete={setDeletingMaterialId}
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeMaterial ? (
                    <div className="border rounded-lg p-4 bg-background shadow-lg">
                      <div className="flex items-start gap-3">
                        <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="mt-0.5">{getMaterialIcon(activeMaterial.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{activeMaterial.title}</h4>
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">
                              {getMaterialTypeLabel(activeMaterial.type)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {activeMaterial.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setIsAddMaterialOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Materi
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Section Modal */}
      <EditSectionModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUpdate={onUpdate}
        section={section}
      />

      {/* Delete Section Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Section?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus section &quot;{section.title}&quot;? 
              Semua materi di dalam section ini juga akan dihapus. 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Material Modal */}
      <AddMaterialModal
        isOpen={isAddMaterialOpen}
        onClose={() => setIsAddMaterialOpen(false)}
        onAdd={onUpdate}
        sectionId={section.id}
      />

      {/* Edit Material Modal */}
      {editingMaterial && (
        <EditMaterialModal
          isOpen={true}
          onClose={() => setEditingMaterial(null)}
          onUpdate={onUpdate}
          material={editingMaterial}
        />
      )}

      {/* Delete Material Dialog */}
      <AlertDialog
        open={deletingMaterialId !== null}
        onOpenChange={(open) => !open && setDeletingMaterialId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Materi?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus materi ini? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingMaterialId && handleDeleteMaterial(deletingMaterialId)}
              disabled={isDeletingMaterial}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingMaterial ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
