"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/optimized-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Material } from "@/types/section";
import { updateMaterial } from "@/lib/api/sections";
import { MaterialFilesManagement } from "@/components/class/material-files-management";
import { toast } from "sonner";
import { Maximize2 } from "lucide-react";
import { useFullscreenPreference } from "@/hooks/use-fullscreen-preference";

interface EditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  classId: string;
  sectionId: number;
  material: Material;
  basePath?: string;
  defaultTab?: "content" | "files";
}

export function EditMaterialModal({
  isOpen,
  onClose,
  onUpdate,
  classId,
  sectionId,
  material,
  basePath = "/course",
  defaultTab = "content",
}: EditMaterialModalProps) {
  const router = useRouter();
  const { preference, setPreference } = useFullscreenPreference();
  const [title, setTitle] = useState(material.title);
  const [content, setContent] = useState(material.content);
  const [xp, setXp] = useState(material.xp?.toString() || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "files">(defaultTab);

  useEffect(() => {
    setTitle(material.title);
    setContent(material.content);
    setXp(material.xp?.toString() || "");
    setActiveTab(defaultTab);
  }, [material, defaultTab]);

  useEffect(() => {
    if (isOpen && preference === "fullscreen") {
      onClose();
      const params = new URLSearchParams({
        sectionId: sectionId.toString(),
        materialId: material.id.toString(),
        title: encodeURIComponent(material.title),
        content: encodeURIComponent(material.content),
        ...(material.xp && { xp: material.xp.toString() }),
        ...(activeTab === "files" && { openFilesTab: "true" }),
      });
      router.push(`${basePath}/${classId}/material/edit?${params}`);
    }
  }, [
    isOpen,
    preference,
    classId,
    sectionId,
    material,
    basePath,
    activeTab,
    onClose,
    router,
  ]);

  const handleExpand = () => {
    setPreference("fullscreen");
    onClose();
    const params = new URLSearchParams({
      sectionId: sectionId.toString(),
      materialId: material.id.toString(),
      title: encodeURIComponent(material.title),
      content: encodeURIComponent(material.content),
      ...(material.xp && { xp: material.xp.toString() }),
      ...(activeTab === "files" && { openFilesTab: "true" }),
    });
    router.push(`${basePath}/${classId}/material/edit?${params}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Judul materi wajib diisi");
      return;
    }

    if (title.trim().length > 255) {
      toast.error("Judul materi maksimal 255 karakter");
      return;
    }

    if (!content.trim()) {
      toast.error("Konten materi wajib diisi");
      return;
    }

    const xpValue = xp ? parseInt(xp) : undefined;
    if (xp && (isNaN(xpValue!) || xpValue! < 0)) {
      toast.error("XP harus berupa angka positif");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateMaterial(classId, sectionId, material.id, {
        title: title.trim(),
        content: content.trim(),
        xp: xpValue,
      });
      toast.success("Materi berhasil diperbarui");
      onUpdate();
      onClose();
    } catch {
      toast.error("Gagal memperbarui materi");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleExpand}
              disabled={isSubmitting}
              title="Buka fullscreen"
              className="shrink-0"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <DialogTitle>Edit Materi</DialogTitle>
              <DialogDescription>
                Perbarui informasi materi dan kelola file
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "content" | "files")}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">Konten Materi</TabsTrigger>
            <TabsTrigger value="files">File Materi</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="flex-1 overflow-y-auto mt-4">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 px-1">
                <div className="space-y-2">
                  <Label htmlFor="edit-material-title">
                    Judul Materi <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-material-title"
                    placeholder="Contoh: Pengenalan React Hooks"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                    autoFocus
                    maxLength={255}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maksimal 255 karakter
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-material-content">
                    Konten Materi <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="edit-material-content"
                    placeholder="Tulis konten materi pembelajaran di sini... Bisa berupa penjelasan, link video, link dokumen, dll."
                    value={content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setContent(e.target.value)
                    }
                    disabled={isSubmitting}
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Konten bisa berupa teks, link YouTube, link gambar, link
                    PDF, dll.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-material-xp">XP Reward (Opsional)</Label>
                  <Input
                    id="edit-material-xp"
                    type="number"
                    min="0"
                    placeholder="Contoh: 10"
                    value={xp}
                    onChange={(e) => setXp(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    XP yang didapat siswa setelah menyelesaikan materi ini
                  </p>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="files" className="flex-1 overflow-y-auto mt-4">
            {activeTab === "files" && (
              <MaterialFilesManagement 
                key={`material-files-${material.id}`}
                materialId={material.id} 
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
