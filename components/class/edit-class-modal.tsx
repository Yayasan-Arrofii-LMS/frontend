"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Class } from "@/types/class";
import { updateClass } from "@/lib/api/classes";
import { createCategory } from "@/lib/api/category";
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
import { Loader2, X, Image as ImageIcon, Plus, Tag, Check, UserCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/use-categories";
import { z } from "zod";

// Validation schema
const classUpdateSchema = z.object({
  title: z
    .string()
    .min(3, "Judul harus minimal 3 karakter")
    .max(100, "Judul maksimal 100 karakter"),
  description: z
    .string()
    .min(10, "Deskripsi harus minimal 10 karakter")
    .max(500, "Deskripsi maksimal 500 karakter"),
});

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (classData: Class) => void;
  classData: Class | null;
}

export function EditClassModal({
  isOpen,
  onClose,
  onUpdate,
  classData,
}: EditClassModalProps) {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    categoryId: number | null;
    registrationType: "AUTO" | "MANUAL";
  }>({
    title: "",
    description: "",
    categoryId: null,
    registrationType: "AUTO",
  });
  const {
    categories,
    isLoading: isCategoriesLoading,
    addCategory,
    refetch: refetchCategories,
  } = useCategories();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);
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

  // Load initial data when modal opens
  useEffect(() => {
    if (classData) {
      setFormData({
        title: classData.title,
        description: classData.description,
        categoryId: classData.categoryId ?? null,
        registrationType: classData.registrationType || "AUTO",
      });
      setCoverImagePreview(classData.coverImage);
      setCoverImage(null);
    }
  }, [classData]);

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
    setCoverImagePreview(classData?.coverImage || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreateCategory = async () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      toast.error("Nama kategori tidak boleh kosong");
      return;
    }
    if (trimmedName.length > 100) {
      toast.error("Nama kategori maksimal 100 karakter");
      return;
    }

    // Cek apakah kategori sudah ada di daftar lokal (case-insensitive)
    const existing = categories.find(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existing) {
      setFormData((prev) => ({ ...prev, categoryId: existing.id }));
      toast.info(`Kategori "${existing.name}" sudah ada dan dipilih otomatis.`);
      setIsAddingCategory(false);
      setNewCategoryName("");
      return;
    }

    setIsSubmittingCategory(true);
    try {
      const created = await createCategory(trimmedName);
      addCategory(created);
      setFormData((prev) => ({ ...prev, categoryId: created.id }));
      toast.success(`Kategori "${created.name}" berhasil dibuat dan dipilih!`);
      setIsAddingCategory(false);
      setNewCategoryName("");
    } catch (error: any) {
      console.error("Gagal menambahkan kategori:", error);
      const message = error?.message || "Gagal membuat kategori baru";
      if (
        message.toLowerCase().includes("already exists") ||
        message.toLowerCase().includes("sudah ada")
      ) {
        const refreshed = await refetchCategories();
        const found = refreshed.find(
          (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (found) {
          setFormData((prev) => ({ ...prev, categoryId: found.id }));
          toast.info(`Kategori "${found.name}" sudah ada dan dipilih otomatis.`);
          setIsAddingCategory(false);
          setNewCategoryName("");
          return;
        }
      }
      toast.error(message);
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!classData) return;

    // Validasi form data
    try {
      classUpdateSchema.parse(formData);
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
      const updatedClass = await updateClass(classData.id, {
        ...formData,
        coverImage,
      });
      onUpdate(updatedClass);
      toast.success("Kelas berhasil diperbarui");

      // Reset form
      setErrors({});
      setIsAddingCategory(false);
      setNewCategoryName("");
      onClose();
    } catch (error: unknown) {
      console.error("Error updating class:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Gagal memperbarui kelas");
      } else {
        toast.error("Terjadi kesalahan saat memperbarui kelas");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setErrors({});
      setCoverImage(null);
      setIsAddingCategory(false);
      setNewCategoryName("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[620px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-5 sm:p-6 pb-4 border-b shrink-0 pr-12">
          <DialogTitle className="text-xl font-semibold">
            Edit Kelas
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
            {/* Cover Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="cover-image">Cover Kelas</Label>
              {coverImagePreview ? (
                <div className="relative w-full h-40 sm:h-48 rounded-lg overflow-hidden border-2 border-border">
                  <Image
                    src={coverImagePreview}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {coverImage && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Ganti Cover
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
            </div>

            {/* Category Select & Quick Add */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="category" className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  Kategori Kelas{" "}
                  <span className="text-muted-foreground text-sm font-normal">
                    (Opsional)
                  </span>
                </Label>
                {!isAddingCategory && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-primary hover:text-primary/90 hover:bg-primary/10 px-2 flex items-center gap-1 font-medium transition-colors"
                    onClick={() => setIsAddingCategory(true)}
                    disabled={isLoading}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Tambah Kategori Baru
                  </Button>
                )}
              </div>

              {isAddingCategory ? (
                <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-2.5 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5 text-primary" />
                      Buat & Tambahkan Kategori Baru
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCategory(false);
                        setNewCategoryName("");
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isSubmittingCategory}
                    >
                      Batal
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="Contoh: Pemrograman Web, Robotika..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateCategory();
                        }
                      }}
                      className="h-9 text-sm bg-background border-border"
                      disabled={isSubmittingCategory}
                      autoFocus
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateCategory}
                      disabled={isSubmittingCategory || !newCategoryName.trim()}
                      className="h-9 px-3 shrink-0 gap-1"
                    >
                      {isSubmittingCategory ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Simpan</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Kategori baru langsung tersimpan di sistem dan dapat digunakan kembali.
                  </p>
                </div>
              ) : (
                <Select
                  value={formData.categoryId ? formData.categoryId.toString() : "none"}
                  onValueChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: val === "none" ? null : Number(val),
                    }))
                  }
                  disabled={isLoading || isCategoriesLoading}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Pilih Kategori Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tanpa Kategori</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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

            {/* Mekanisme Pendaftaran */}
            <div className="space-y-2.5 rounded-lg border p-3.5 bg-muted/20">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-primary" />
                  Mekanisme Pendaftaran
                </Label>
                <p className="text-xs text-muted-foreground">
                  Tentukan bagaimana siswa dapat bergabung ke dalam kelas ini.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, registrationType: "AUTO" }))
                  }
                  className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                    formData.registrationType === "AUTO"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="editRegistrationType"
                    checked={formData.registrationType === "AUTO"}
                    onChange={() => {}}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-xs font-semibold leading-tight text-foreground">
                      Pendaftaran Terbuka
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Siswa langsung diterima saat mendaftar tanpa menunggu persetujuan.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, registrationType: "MANUAL" }))
                  }
                  className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                    formData.registrationType === "MANUAL"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="editRegistrationType"
                    checked={formData.registrationType === "MANUAL"}
                    onChange={() => {}}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-xs font-semibold leading-tight text-foreground">
                      Persetujuan Guru
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Guru harus menyetujui pendaftaran sebelum siswa dapat mengakses materi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 sm:p-6 pt-3 sm:pt-4 border-t bg-background shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
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
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
