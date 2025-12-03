"use client";

import { useState } from "react";
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
import { createMaterialFile } from "@/lib/api/material-files";
import { Upload } from "lucide-react";

interface AddMaterialFileModalProps {
  materialId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddMaterialFileModal({
  materialId,
  open,
  onOpenChange,
  onSuccess,
}: AddMaterialFileModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ title?: string; file?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: { title?: string; file?: string } = {};
    if (!title.trim()) newErrors.title = "Judul file wajib diisi";
    if (!file) newErrors.file = "File wajib dipilih";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      if (file) {
        formData.append("file", file);
      }

      await createMaterialFile(materialId, formData);
      toast.success("File berhasil ditambahkan");
      setTitle("");
      setFile(null);
      setErrors({});
      onOpenChange(false);
      onSuccess();
    } catch (error: unknown) {
      console.error("Gagal menambahkan file materi:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menambahkan file";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah File Materi</DialogTitle>
          <DialogDescription>
            Upload file baru untuk materi ini
          </DialogDescription>
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
                  setErrors((prev) => ({ ...prev, title: undefined }));
                }}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setErrors((prev) => ({ ...prev, file: undefined }));
                }}
              />
              {errors.file && (
                <p className="text-sm text-destructive">{errors.file}</p>
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
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Mengupload...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
