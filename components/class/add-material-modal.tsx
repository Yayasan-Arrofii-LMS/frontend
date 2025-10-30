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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MaterialType } from "@/types/section";
import { createMaterial } from "@/lib/api/sections";
import { toast } from "sonner";

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
  sectionId: string;
}

export function AddMaterialModal({
  isOpen,
  onClose,
  onAdd,
  sectionId,
}: AddMaterialModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<MaterialType>("text");
  const [content, setContent] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await createMaterial(sectionId, {
        title: title.trim(),
        description: description.trim(),
        type,
        content: content.trim(),
        youtubeUrl: youtubeUrl.trim() || undefined,
      });
      toast.success("Materi berhasil ditambahkan");
      onAdd();
      handleClose();
    } catch (error) {
      toast.error("Gagal menambahkan materi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle("");
      setDescription("");
      setType("text");
      setContent("");
      setYoutubeUrl("");
      onClose();
    }
  };

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
                placeholder="Contoh: Video Pengenalan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="material-description">
                Deskripsi <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="material-description"
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
              <Label htmlFor="material-type">
                Tipe Materi <span className="text-destructive">*</span>
              </Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as MaterialType)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="material-type">
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
                <Label htmlFor="material-content">Konten Teks</Label>
                <Textarea
                  id="material-content"
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
                <Label htmlFor="material-content">
                  URL {type === "video" ? "Video" : type === "image" ? "Gambar" : "Dokumen"}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="material-content"
                  placeholder={`https://example.com/${type === "video" ? "video" : type === "image" ? "image" : "document"}.${type === "video" ? "mp4" : type === "image" ? "jpg" : "pdf"}`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            )}

            {type === "video" && (
              <div className="space-y-2">
                <Label htmlFor="youtube-url">Link YouTube (Opsional)</Label>
                <Input
                  id="youtube-url"
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
