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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Workshop,
  WorkshopFormData,
  WorkshopCategory,
  WorkshopType,
} from "@/types/workshop";
import { Video, MapPin, Sparkles, Users, Plus, Tag, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { normalizeImageUrl } from "@/lib/utils";
import { useCategories } from "@/hooks/use-categories";
import { createCategory } from "@/lib/api/category";

interface WorkshopFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workshopToEdit?: Workshop | null;
  onSubmit: (data: WorkshopFormData) => void;
}

const CATEGORIES: WorkshopCategory[] = [
  "Sains Alam",
  "Keterampilan Hidup",
  "Kewirausahaan",
  "Budaya",
  "Teknologi & Lingkungan",
];

const DEFAULT_THUMBNAILS = [
  "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
];

export function WorkshopFormModal({
  open,
  onOpenChange,
  workshopToEdit,
  onSubmit,
}: WorkshopFormModalProps) {
  const isEditing = !!workshopToEdit;
  const {
    categories: backendCategories,
    addCategory,
    refetch: refetchCategories,
  } = useCategories();

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  const [formData, setFormData] = useState<WorkshopFormData>({
    title: "",
    instructorName: "",
    instructorId: "",
    description: "",
    thumbnail: DEFAULT_THUMBNAILS[0],
    category: "Sains Alam",
    date: "",
    startTime: "09:00",
    endTime: "12:00",
    type: "Offline",
    location: "",
    meetingLink: "",
    quota: 30,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsAddingCategory(false);
    setNewCategoryName("");
    if (workshopToEdit) {
      setFormData({
        title: workshopToEdit.title,
        instructorName: workshopToEdit.instructorName || "",
        instructorId: workshopToEdit.instructorId || "",
        description: workshopToEdit.description,
        thumbnail: workshopToEdit.thumbnail || DEFAULT_THUMBNAILS[0],
        category: workshopToEdit.category,
        date: workshopToEdit.date,
        startTime: workshopToEdit.startTime,
        endTime: workshopToEdit.endTime,
        type: workshopToEdit.type,
        location: workshopToEdit.location || "",
        meetingLink: workshopToEdit.meetingLink || "",
        quota: workshopToEdit.quota,
      });
    } else {
      setFormData({
        title: "",
        instructorName: "",
        instructorId: "",
        description: "",
        thumbnail: DEFAULT_THUMBNAILS[Math.floor(Math.random() * DEFAULT_THUMBNAILS.length)],
        category: "Sains Alam",
        date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
        startTime: "09:00",
        endTime: "12:00",
        type: "Offline",
        location: "Sekolah Alam, Zona Terbuka",
        meetingLink: "",
        quota: 30,
      });
    }
    setErrors({});
  }, [workshopToEdit, open]);

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

    // Cek apakah sudah ada di backendCategories (case-insensitive)
    const existing = backendCategories.find(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existing) {
      setFormData((prev) => ({ ...prev, category: existing.name }));
      toast.info(`Kategori "${existing.name}" sudah ada dan dipilih otomatis.`);
      setIsAddingCategory(false);
      setNewCategoryName("");
      return;
    }

    setIsSubmittingCategory(true);
    try {
      const created = await createCategory(trimmedName);
      addCategory(created);
      setFormData((prev) => ({ ...prev, category: created.name }));
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
          setFormData((prev) => ({ ...prev, category: found.name }));
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

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.title.trim()) {
      errs.title = "Judul workshop wajib diisi";
    }
    if (!formData.instructorName?.trim()) {
      errs.instructorName = "Nama instruktur / penyelenggara wajib diisi";
    }
    if (!formData.description.trim()) {
      errs.description = "Deskripsi workshop wajib diisi";
    }
    if (!formData.date) {
      errs.date = "Tanggal pelaksanaan wajib diisi";
    }
    if (!formData.startTime) {
      errs.startTime = "Waktu mulai wajib diisi";
    }
    if (!formData.endTime) {
      errs.endTime = "Waktu selesai wajib diisi";
    }
    if (!formData.quota || formData.quota <= 0) {
      errs.quota = "Kuota minimal 1 peserta";
    }

    if (formData.type === "Offline" && !formData.location?.trim()) {
      errs.location = "Lokasi wajib diisi untuk workshop Offline";
    }

    if (formData.type === "Online" && !formData.meetingLink?.trim()) {
      errs.meetingLink = "Link meeting (Zoom/GMeet) wajib diisi untuk workshop Online";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Harap periksa kembali isian form Anda");
      return;
    }

    const finalData: WorkshopFormData = {
      ...formData,
      thumbnail: formData.thumbnailFile
        ? formData.thumbnail
        : normalizeImageUrl(formData.thumbnail),
    };

    onSubmit(finalData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {isEditing ? "Edit Workshop" : "Buat Workshop Baru"}
          </DialogTitle>
          <DialogDescription>
            Isi informasi workshop dengan lengkap. Field yang relevan akan menyesuaikan tipe kegiatan Online atau Offline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Judul */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm font-semibold">
              Judul Workshop <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Contoh: Eksplorasi Botani Hutan Tropis"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>

          {/* Instruktur / Penyelenggara */}
          <div className="space-y-1.5">
            <Label htmlFor="instructorName" className="text-sm font-semibold flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" />
              Nama Instruktur / Penyelenggara <span className="text-red-500">*</span>
            </Label>
            <Input
              id="instructorName"
              placeholder="Contoh: Kak Danang / Dr. Siti Aminah"
              value={formData.instructorName || ""}
              onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
              className={errors.instructorName ? "border-red-500" : ""}
            />
            {errors.instructorName && (
              <p className="text-xs text-red-500">{errors.instructorName}</p>
            )}
          </div>

          {/* Kategori & Tipe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="category" className="text-sm font-semibold flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  Kategori <span className="text-red-500">*</span>
                </Label>
              </div>

              {isAddingCategory ? (
                <div className="p-2.5 rounded-lg border border-primary/30 bg-primary/5 space-y-2 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5 text-primary" />
                      Kategori Baru
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
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="text"
                      placeholder="Nama kategori baru..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateCategory();
                        }
                      }}
                      className="h-8 text-xs bg-background border-border"
                      disabled={isSubmittingCategory}
                      autoFocus
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateCategory}
                      disabled={isSubmittingCategory || !newCategoryName.trim()}
                      className="h-8 px-2.5 text-xs shrink-0 gap-1"
                    >
                      {isSubmittingCategory ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Simpan</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <Select
                  value={formData.category}
                  onValueChange={(val) => {
                    if (val === "__ADD_NEW_CATEGORY__") {
                      setIsAddingCategory(true);
                      return;
                    }
                    setFormData({ ...formData, category: val as WorkshopCategory });
                  }}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <div className="p-1 pb-1.5">
                      <SelectItem
                        value="__ADD_NEW_CATEGORY__"
                        className="cursor-pointer rounded-md border border-emerald-300 dark:border-emerald-700/70 bg-emerald-50 dark:bg-emerald-950/60 font-semibold text-emerald-800 dark:text-emerald-300 shadow-xs transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/80 focus:bg-emerald-100 dark:focus:bg-emerald-900/80 focus:text-emerald-900 dark:focus:text-emerald-200 data-[highlighted]:bg-emerald-100 dark:data-[highlighted]:bg-emerald-900/80 data-[highlighted]:text-emerald-900 dark:data-[highlighted]:text-emerald-100 my-0.5"
                      >
                        <div className="flex items-center gap-2 py-0.5">
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-bold leading-none text-emerald-700 dark:text-emerald-300">
                              + Tambah Kategori Baru
                            </span>
                            <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-normal leading-tight mt-0.5">
                              Buat kategori kustom baru
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectSeparator className="my-1.5" />
                    </div>

                    {backendCategories.length > 0 ? (
                      backendCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))
                    ) : (
                      CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="type" className="text-sm font-semibold">
                Tipe Kegiatan <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(val) =>
                  setFormData({ ...formData, type: val as WorkshopType })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Pilih Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Offline">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-amber-600" />
                      <span>Offline (Tatap Muka)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Online">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-blue-600" />
                      <span>Online (Virtual Room)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conditional Field: Lokasi (Offline) or Link (Online) */}
          {formData.type === "Offline" ? (
            <div className="space-y-1.5 p-3 rounded-lg border bg-amber-500/5 border-amber-500/20">
              <Label htmlFor="location" className="text-sm font-semibold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <MapPin className="h-4 w-4" />
                Lokasi Pelaksanaan <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                placeholder="Contoh: Kebun Percobaan Sekolah Alam / Pendopo Budaya"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={errors.location ? "border-red-500" : ""}
              />
              {errors.location && (
                <p className="text-xs text-red-500">{errors.location}</p>
              )}
            </div>
          ) : (
            <div className="space-y-1.5 p-3 rounded-lg border bg-blue-500/5 border-blue-500/20">
              <Label htmlFor="meetingLink" className="text-sm font-semibold flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                <Video className="h-4 w-4" />
                Link Meeting Virtual (Zoom / Google Meet) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="meetingLink"
                placeholder="https://zoom.us/j/... atau https://meet.google.com/..."
                value={formData.meetingLink || ""}
                onChange={(e) =>
                  setFormData({ ...formData, meetingLink: e.target.value })
                }
                className={errors.meetingLink ? "border-red-500" : ""}
              />
              {errors.meetingLink && (
                <p className="text-xs text-red-500">{errors.meetingLink}</p>
              )}
            </div>
          )}

          {/* Tanggal & Waktu */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-sm font-semibold">
                Tanggal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={errors.date ? "border-red-500" : ""}
              />
              {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="startTime" className="text-sm font-semibold">
                Jam Mulai <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className={errors.startTime ? "border-red-500" : ""}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endTime" className="text-sm font-semibold">
                Jam Selesai <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className={errors.endTime ? "border-red-500" : ""}
              />
            </div>
          </div>

          {/* Kuota & Thumbnail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="quota" className="text-sm font-semibold">
                Kuota Maksimal Peserta <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quota"
                type="number"
                min="1"
                placeholder="30"
                value={formData.quota || ""}
                onChange={(e) =>
                  setFormData({ ...formData, quota: parseInt(e.target.value) || 0 })
                }
                className={errors.quota ? "border-red-500" : ""}
              />
              {errors.quota && <p className="text-xs text-red-500">{errors.quota}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="thumbnail" className="text-sm font-semibold">
                Gambar / Thumbnail
              </Label>
              <div className="space-y-2">
                <Input
                  id="thumbnailFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({
                        ...formData,
                        thumbnailFile: file,
                        thumbnail: URL.createObjectURL(file),
                      });
                    }
                  }}
                  className="cursor-pointer file:cursor-pointer"
                />
                <Input
                  id="thumbnail"
                  placeholder="Atau masukkan URL gambar (https://...)"
                  value={formData.thumbnail}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      thumbnail: e.target.value,
                      thumbnailFile: null,
                    })
                  }
                  className="text-xs text-muted-foreground"
                />
              </div>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-semibold">
              Deskripsi & Silabus Kegiatan <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Jelaskan tujuan, materi yang akan dipelajari, perlengkapan yang perlu dibawa, dan output workshop..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit">
              {isEditing ? "Simpan Perubahan" : "Publikasikan Workshop"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
