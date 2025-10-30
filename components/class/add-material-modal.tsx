"use client";

import { useState } from "react";
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
import { createMaterial } from "@/lib/api/sections";
import { toast } from "sonner";

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
  classId: string;
  sectionId: number;
}

export function AddMaterialModal({
  isOpen,
  onClose,
  onAdd,
  classId,
  sectionId,
}: AddMaterialModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [xp, setXp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await createMaterial(classId, sectionId, {
        title: title.trim(),
        content: content.trim(),
        xp: xpValue,
      });
      toast.success("Materi berhasil ditambahkan");
      onAdd();
      handleClose();
    } catch {
      toast.error("Gagal menambahkan materi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle("");
      setContent("");
      setXp("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Materi Baru</DialogTitle>
            <DialogDescription>
              Tambahkan materi pembelajaran ke section ini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="space-y-2">
              <Label htmlFor="material-title">
                Judul Materi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="material-title"
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
              <Label htmlFor="material-content">
                Konten Materi <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="material-content"
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
              <Label htmlFor="material-xp">XP Reward (Opsional)</Label>
              <Input
                id="material-xp"
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
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Tambah Materi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
