"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createMaterial } from "@/lib/api/sections";
import { MaterialFilesManagement } from "@/components/class/material-files-management";
import { toast } from "sonner";
import { Maximize2 } from "lucide-react";
import { useFullscreenPreference } from "@/hooks/use-fullscreen-preference";
import { isYouTubeUrl } from "@/lib/utils/youtube";

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
  classId: string;
  sectionId: number;
  basePath?: string;
}

export function AddMaterialModal({
  isOpen,
  onClose,
  onAdd,
  classId,
  sectionId,
  basePath = "/course",
}: AddMaterialModalProps) {
  const router = useRouter();
  const { preference, setPreference } = useFullscreenPreference();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [xp, setXp] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "files">("content");
  const [createdMaterialId, setCreatedMaterialId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && preference === "fullscreen") {
      onClose();
      router.push(`${basePath}/${classId}/material/add?sectionId=${sectionId}`);
    }
  }, [isOpen, preference, classId, sectionId, basePath, onClose, router]);

  const handleExpand = () => {
    setPreference("fullscreen");
    onClose();
    router.push(`${basePath}/${classId}/material/add?sectionId=${sectionId}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Judul materi wajib diisi");
      return;
    }

    if (title.trim().length > 255) {
      toast.error("Judul materi maksimal 255 karakter");
      return;
    }

    if (!content.trim()) {
      toast.error("Konten materi wajib diisi");
      return;
    }

    const xpValue = xp ? parseInt(xp) : undefined;
    if (xp && (isNaN(xpValue!) || xpValue! < 0)) {
      toast.error("XP harus berupa angka positif");
      return;
    }

    if (videoLink.trim() && !isYouTubeUrl(videoLink.trim())) {
      toast.error("Link video harus berupa URL YouTube yang valid");
      return;
    }

    setIsSubmitting(true);
    try {
      const newMaterial = await createMaterial(classId, sectionId, {
        title: title.trim(),
        content: content.trim(),
        xp: xpValue,
        video_link: videoLink.trim() || undefined,
      });
      toast.success("Materi berhasil ditambahkan");

      // Save the created material ID and switch to files tab
      setCreatedMaterialId(newMaterial.id);
      setActiveTab("files");
      
      // Refresh data
      await onAdd();
    } catch {
      toast.error("Gagal menambahkan materi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle("");
      setContent("");
      setXp("");
      setVideoLink("");
      setCreatedMaterialId(null);
      setActiveTab("content");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleExpand}
              disabled={isSubmitting}
              title="Buka fullscreen"
              className="shrink-0"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <DialogTitle>Tambah Materi Baru</DialogTitle>
              <DialogDescription>
                {createdMaterialId 
                  ? "Materi berhasil dibuat. Tambahkan file jika diperlukan"
                  : "Isi konten materi dan tambahkan file jika diperlukan"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "content" | "files")}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">Konten Materi</TabsTrigger>
            <TabsTrigger value="files">
              File Materi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="flex-1 overflow-y-auto mt-4">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 px-1">
                <div className="space-y-2">
                  <Label htmlFor="material-title">
                    Judul Materi <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="material-title"
                    placeholder="Contoh: Pengenalan React Hooks"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting || !!createdMaterialId}
                    autoFocus
                    maxLength={255}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maksimal 255 karakter
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material-content">
                    Konten Materi <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="material-content"
                    placeholder="Tulis konten materi pembelajaran di sini... Bisa berupa penjelasan, link video, link dokumen, dll."
                    value={content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setContent(e.target.value)
                    }
                    disabled={isSubmitting || !!createdMaterialId}
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Konten bisa berupa teks, link YouTube, link gambar, link PDF, dll.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material-xp">XP Reward (Opsional)</Label>
                  <Input
                    id="material-xp"
                    type="number"
                    min="0"
                    placeholder="Contoh: 10"
                    value={xp}
                    onChange={(e) => setXp(e.target.value)}
                    disabled={isSubmitting || !!createdMaterialId}
                  />
                  <p className="text-xs text-muted-foreground">
                    XP yang didapat siswa setelah menyelesaikan materi ini
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material-video-link">Link Video YouTube (Opsional)</Label>
                  <Input
                    id="material-video-link"
                    type="url"
                    placeholder="Contoh: https://youtu.be/Mm3-gk9bdiE atau https://www.youtube.com/watch?v=..."
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                    disabled={isSubmitting || !!createdMaterialId}
                  />
                  <p className="text-xs text-muted-foreground">
                    Hanya link video YouTube yang diperbolehkan
                  </p>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  {createdMaterialId ? "Selesai" : "Batal"}
                </Button>
                {!createdMaterialId && (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Menyimpan..." : "Simpan Materi"}
                  </Button>
                )}
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="files" className="flex-1 overflow-y-auto mt-4">
            {createdMaterialId ? (
              <MaterialFilesManagement 
                key={`material-files-${createdMaterialId}`}
                materialId={createdMaterialId} 
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <svg
                    className="h-6 w-6 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  File siap untuk ditambahkan
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  Silakan simpan konten materi terlebih dahulu pada tab &quot;Konten Materi&quot;. Setelah itu, Anda dapat menambahkan file di sini.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("content")}
                >
                  Kembali ke Konten Materi
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
