"use client";

import { useState, useEffect } from "react";
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
import { Material } from "@/types/section";
import { updateMaterial } from "@/lib/api/sections";
import { toast } from "sonner";

interface EditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  classId: string;
  sectionId: number;
  material: Material;
}

export function EditMaterialModal({
  isOpen,
  onClose,
  onUpdate,
  classId,
  sectionId,
  material,
}: EditMaterialModalProps) {
  const [title, setTitle] = useState(material.title);
  const [content, setContent] = useState(material.content);
  const [xp, setXp] = useState(material.xp?.toString() || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(material.title);
    setContent(material.content);
    setXp(material.xp?.toString() || "");
  }, [material]);

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
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Materi</DialogTitle>
            <DialogDescription>
              Perbarui informasi materi pembelajaran
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
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
                Konten bisa berupa teks, link YouTube, link gambar, link PDF, dll.
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
          <DialogFooter>
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
      </DialogContent>
    </Dialog>
  );
}
