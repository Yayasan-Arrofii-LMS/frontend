"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Section } from "@/types/section";
import { updateSection } from "@/lib/api/sections";
import { toast } from "sonner";

interface EditSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  section: Section;
}

export function EditSectionModal({
  isOpen,
  onClose,
  onUpdate,
  section,
}: EditSectionModalProps) {
  const [title, setTitle] = useState(section.title);
  const [description, setDescription] = useState(section.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(section.title);
    setDescription(section.description || "");
  }, [section]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Judul section wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateSection(section.id, {
        title: title.trim(),
        description: description.trim() || undefined,
      });
      toast.success("Section berhasil diperbarui");
      onUpdate();
      onClose();
    } catch (error) {
      toast.error("Gagal memperbarui section");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>
              Perbarui informasi section
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">
                Judul Section <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-title"
                placeholder="Contoh: Pengenalan Dasar"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Deskripsi (Opsional)</Label>
              <Textarea
                id="edit-description"
                placeholder="Deskripsi singkat tentang section ini..."
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
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
