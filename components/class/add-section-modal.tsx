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
import { createSection } from "@/lib/api/sections";
import { toast } from "sonner";

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
  classId: string;
}

export function AddSectionModal({
  isOpen,
  onClose,
  onAdd,
  classId,
}: AddSectionModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Judul section wajib diisi");
      return;
    }

    if (title.trim().length < 2) {
      toast.error("Judul section minimal 2 karakter");
      return;
    }

    if (title.trim().length > 255) {
      toast.error("Judul section maksimal 255 karakter");
      return;
    }

    setIsSubmitting(true);
    try {
      await createSection(classId, {
        title: title.trim(),
        description: description.trim() || null,
      });
      toast.success("Section berhasil ditambahkan");
      onAdd();
      handleClose();
    } catch {
      toast.error("Gagal menambahkan section");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle("");
      setDescription("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Section Baru</DialogTitle>
            <DialogDescription>
              Tambahkan section baru untuk mengorganisir materi pembelajaran
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Judul Section <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Contoh: Pengenalan Dasar"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi (Opsional)</Label>
              <Textarea
                id="description"
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
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Tambah Section"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
