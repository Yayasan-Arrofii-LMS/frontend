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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Material, MaterialType } from "@/types/section";
import { updateMaterial } from "@/lib/api/sections";
import { toast } from "sonner";

interface EditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  material: Material;
}

export function EditMaterialModal({
  isOpen,
  onClose,
  onUpdate,
  material,
}: EditMaterialModalProps) {
  const [title, setTitle] = useState(material.title);
  const [description, setDescription] = useState(material.description);
  const [type, setType] = useState<MaterialType>(material.type);
  const [content, setContent] = useState(material.content);
  const [youtubeUrl, setYoutubeUrl] = useState(material.youtubeUrl || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(material.title);
    setDescription(material.description);
    setType(material.type);
    setContent(material.content);
    setYoutubeUrl(material.youtubeUrl || "");
  }, [material]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Judul materi wajib diisi");
      return;
    }

    if (!description.trim()) {
      toast.error("Deskripsi materi wajib diisi");
      return;
    }

    if (!content.trim() && type !== "text") {
      toast.error("Konten/URL materi wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateMaterial(material.id, {
        title: title.trim(),
        description: description.trim(),
        type,
        content: content.trim(),
        youtubeUrl: youtubeUrl.trim() || undefined,
      });
      toast.success("Materi berhasil diperbarui");
      onUpdate();
      onClose();
    } catch (error) {
      toast.error("Gagal memperbarui materi");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                placeholder="Contoh: Video Pengenalan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-material-description">
                Deskripsi <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="edit-material-description"
                placeholder="Deskripsi singkat tentang materi ini..."
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setDescription(e.target.value)
                }
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-material-type">
                Tipe Materi <span className="text-destructive">*</span>
              </Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as MaterialType)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="edit-material-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Teks</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="image">Gambar</SelectItem>
                  <SelectItem value="document">Dokumen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === "text" ? (
              <div className="space-y-2">
                <Label htmlFor="edit-material-content">Konten Teks</Label>
                <Textarea
                  id="edit-material-content"
                  placeholder="Tulis konten materi di sini..."
                  value={content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setContent(e.target.value)
                  }
                  disabled={isSubmitting}
                  rows={6}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="edit-material-content">
                  URL {type === "video" ? "Video" : type === "image" ? "Gambar" : "Dokumen"}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-material-content"
                  placeholder={`https://example.com/${type === "video" ? "video" : type === "image" ? "image" : "document"}.${type === "video" ? "mp4" : type === "image" ? "jpg" : "pdf"}`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            )}

            {type === "video" && (
              <div className="space-y-2">
                <Label htmlFor="edit-youtube-url">Link YouTube (Opsional)</Label>
                <Input
                  id="edit-youtube-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Jika materi ini adalah video YouTube, masukkan linknya di sini
                </p>
              </div>
            )}
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
