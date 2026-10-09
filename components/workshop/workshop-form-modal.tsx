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
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Workshop,
  WorkshopFormData,
  WorkshopCategory,
  WorkshopType,
} from "@/types/workshop";
import { Video, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";

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
  "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
];

export function WorkshopFormModal({
  open,
  onOpenChange,
  workshopToEdit,
  onSubmit,
}: WorkshopFormModalProps) {
  const isEditing = !!workshopToEdit;

  const [formData, setFormData] = useState<WorkshopFormData>({
    title: "",
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
    if (workshopToEdit) {
      setFormData({
        title: workshopToEdit.title,
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

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.title.trim()) {
      errs.title = "Judul workshop wajib diisi";
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

    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
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

          {/* Kategori & Tipe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-sm font-semibold">
                Kategori <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(val) =>
                  setFormData({ ...formData, category: val as WorkshopCategory })
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                URL Gambar / Thumbnail
              </Label>
              <Input
                id="thumbnail"
                placeholder="https://..."
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              />
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
