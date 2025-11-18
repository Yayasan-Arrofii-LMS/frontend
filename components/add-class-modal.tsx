"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Class } from "@/types/class";
import { createClass } from "@/lib/api/classes";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/optimized-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

// Validation schema
const classCreateSchema = z.object({
  title: z
    .string()
    .min(3, "Judul harus minimal 3 karakter")
    .max(100, "Judul maksimal 100 karakter"),
  description: z
    .string()
    .min(10, "Deskripsi harus minimal 10 karakter")
    .max(500, "Deskripsi maksimal 500 karakter"),
});

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (classData: Class) => void;
}

export function AddClassModal({ isOpen, onClose, onAdd }: AddClassModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error untuk field yang sedang diubah
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi file type
      if (!file.type.startsWith("image/")) {
        toast.error("File harus berupa gambar");
        return;
      }
      // Validasi file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran gambar maksimal 5MB");
        return;
      }

      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setCoverImage(null);
    setCoverImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi form data
    try {
      classCreateSchema.parse(formData);
      setErrors({}); // Clear errors jika validasi berhasil
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { title?: string; description?: string } = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof typeof fieldErrors] =
              issue.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Mohon perbaiki kesalahan pada form");
        return;
      }
    }

    setIsLoading(true);

    try {
      const newClass = await createClass({
        ...formData,
        coverImage,
      });
      onAdd(newClass);
      toast.success("Kelas baru berhasil dibuat");

      // Reset form
      setFormData({
        title: "",
        description: "",
      });
      setCoverImage(null);
      setCoverImagePreview(null);
      setErrors({});
      onClose();
    } catch (error: unknown) {
      console.error("Error creating class:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Gagal membuat kelas");
      } else {
        toast.error("Terjadi kesalahan saat membuat kelas");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        title: "",
        description: "",
      });
      setCoverImage(null);
      setCoverImagePreview(null);
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Buat Kelas Baru
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Cover Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="cover-image">
                Cover Kelas{" "}
                <span className="text-muted-foreground text-sm">
                  (Opsional)
                </span>
              </Label>
              {coverImagePreview ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-border">
                  <Image
                    src={coverImagePreview}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                >
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Klik untuk upload cover
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG hingga 5MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                id="cover-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                Cover akan dibuat otomatis jika tidak diunggah
              </p>
            </div>

            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title" className="required">
                Judul Kelas
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Contoh: Matematika Dasar"
                className={errors.title ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Description Textarea */}
            <div className="space-y-2">
              <Label htmlFor="description" className="required">
                Deskripsi
              </Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Jelaskan tentang kelas ini..."
                className={`flex min-h-[120px] w-full rounded-md border ${
                  errors.description ? "border-destructive" : "border-input"
                } bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none`}
                disabled={isLoading}
              />
              <div className="flex justify-between items-center">
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground ml-auto">
                  {formData.description.length}/500
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat...
                </>
              ) : (
                "Buat Kelas"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
