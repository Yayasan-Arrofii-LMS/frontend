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
import { toast } from "sonner";
import { updateMaterialFile, MaterialFile } from "@/lib/api/material-files";
import { Save } from "lucide-react";

interface EditMaterialFileModalProps {
  materialId: number;
  file: MaterialFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditMaterialFileModal({
  materialId,
  file,
  open,
  onOpenChange,
  onSuccess,
}: EditMaterialFileModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [errors, setErrors] = useState<{ title?: string }>({});

  useEffect(() => {
    if (file) {
      setTitle(file.title);
    }
  }, [file]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    // Validation
    if (!title.trim()) {
      setErrors({ title: "Judul file wajib diisi" });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);

      await updateMaterialFile(materialId, file.id, formData);
      toast.success("File berhasil diperbarui");
      setTitle("");
      setErrors({});
      onOpenChange(false);
      onSuccess();
    } catch (error: unknown) {
      console.error("Gagal memperbarui file materi:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Gagal memperbarui file";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit File Materi</DialogTitle>
          <DialogDescription>Perbarui informasi file materi</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul File</Label>
              <Input
                id="title"
                placeholder="Masukkan judul file"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors({});
                }}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Save className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
