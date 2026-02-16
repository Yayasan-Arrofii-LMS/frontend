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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaterialEditor } from "@/components/material-editor";
import { Material, UpdateMaterialInput } from "@/types/section";
import { updateMaterial, getMaterial } from "@/lib/api/sections";
import { MaterialFilesManagement } from "@/components/class/material-files-management";
import { toast } from "sonner";
import { Maximize2 } from "lucide-react";
import { useFullscreenPreference } from "@/hooks/use-fullscreen-preference";
import { isYouTubeUrl } from "@/lib/utils/youtube";

interface EditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  classId: string;
  sectionId: number;
  material: Material;
  basePath?: string;
  defaultTab?: "content" | "files";
}

export function EditMaterialModal({
  isOpen,
  onClose,
  onUpdate,
  classId,
  sectionId,
  material,
  basePath = "/course",
  defaultTab = "content",
}: EditMaterialModalProps) {
  const router = useRouter();
  const { preference, setPreference } = useFullscreenPreference();
  const [title, setTitle] = useState(material.title);
  const [content, setContent] = useState(material.content);
  const [xp, setXp] = useState(material.xp?.toString() || "");
  const [videoLink, setVideoLink] = useState(material.video_link || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "files">(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedMaterial, setFetchedMaterial] = useState<Material | null>(null);

  useEffect(() => {
    setTitle(material.title);
    setContent(material.content);
    setXp(material.xp?.toString() || "");
    setVideoLink(material.video_link || "");
    setActiveTab(defaultTab);
  }, [material, defaultTab]);

  // Fetch material data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchMaterialData = async () => {
      try {
        setIsLoading(true);
        const data = await getMaterial(sectionId, material.id);
        setFetchedMaterial(data);

        // Check for draft first, otherwise use fetched data
        const draftKey = `material-edit-draft-${material.id}`;
        const savedDraft = sessionStorage.getItem(draftKey);

        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            setTitle(parsed.title || data.title);
            setContent(parsed.content || data.content);
            setXp(parsed.xp || data.xp?.toString() || "");
            setVideoLink(parsed.videoLink || data.video_link || "");
            sessionStorage.removeItem(draftKey);
          } catch (error) {
            console.error("Failed to parse material draft:", error);
            // Fallback to fetched data
            setTitle(data.title);
            setContent(data.content);
            setXp(data.xp?.toString() || "");
            setVideoLink(data.video_link || "");
          }
        } else {
          // Use fetched data
          setTitle(data.title);
          setContent(data.content);
          setXp(data.xp?.toString() || "");
          setVideoLink(data.video_link || "");
        }
      } catch (error) {
        console.error("Failed to fetch material:", error);
        toast.error("Gagal memuat data materi");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterialData();
  }, [isOpen, sectionId, material.id]);

  const handleExpand = () => {
    // Save draft before expanding
    const formData = {
      title,
      content,
      xp,
      videoLink,
    };
    sessionStorage.setItem(
      `material-edit-draft-${material.id}`,
      JSON.stringify(formData),
    );

    setPreference("fullscreen");
    onClose();
    const params = new URLSearchParams({
      sectionId: sectionId.toString(),
      materialId: material.id.toString(),
      title: encodeURIComponent(material.title),
      content: encodeURIComponent(material.content),
      ...(material.xp && { xp: material.xp.toString() }),
      ...(material.video_link && {
        video_link: encodeURIComponent(material.video_link),
      }),
      ...(activeTab === "files" && { openFilesTab: "true" }),
    });
    router.push(`${basePath}/${classId}/material/edit?${params}`);
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
      const materialData: UpdateMaterialInput = {
        title: title.trim(),
        content: content.trim(),
      };

      // Only include xp if it has a value
      if (xpValue !== undefined) {
        materialData.xp = xpValue;
      }

      // Only include video_link if it's not empty
      if (videoLink.trim()) {
        materialData.video_link = videoLink.trim();
      }

      await updateMaterial(classId, sectionId, material.id, materialData);
      toast.success("Materi berhasil diperbarui");
      onUpdate();
      onClose();
    } catch {
      toast.error("Gagal memperbarui materi");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              <DialogTitle>Edit Materi</DialogTitle>
              <DialogDescription>
                Perbarui informasi materi dan kelola file
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
            <TabsTrigger value="files">File Materi</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="flex-1 overflow-y-auto mt-4">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 px-1">
                <div className="space-y-2">
                  <Label htmlFor="edit-material-title">
                    Judul Materi <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-material-title"
                    placeholder="Contoh: Pengenalan React Hooks"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                    autoFocus
                    maxLength={255}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maksimal 255 karakter
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-material-content">
                    Konten Materi <span className="text-destructive">*</span>
                  </Label>
                  <MaterialEditor
                    value={content}
                    onChange={setContent}
                    disabled={isSubmitting}
                    placeholder="Tulis konten materi pembelajaran di sini... Bisa berupa penjelasan, link, gambar, dll."
                  />
                  <p className="text-xs text-muted-foreground">
                    Gunakan toolbar di atas untuk memformat teks, menambahkan link, gambar, list, dan lainnya.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-material-xp">XP Reward (Opsional)</Label>
                  <Input
                    id="edit-material-xp"
                    type="number"
                    min="0"
                    placeholder="Contoh: 10"
                    value={xp}
                    onChange={(e) => setXp(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    XP yang didapat siswa setelah menyelesaikan materi ini
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-material-video-link">
                    Link Video YouTube (Opsional)
                  </Label>
                  <Input
                    id="edit-material-video-link"
                    type="url"
                    placeholder="Contoh: https://youtu.be/Mm3-gk9bdiE atau https://www.youtube.com/watch?v=..."
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                    disabled={isSubmitting}
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
          </TabsContent>

          <TabsContent value="files" className="flex-1 overflow-y-auto mt-4">
            {activeTab === "files" && !isLoading && (
              <MaterialFilesManagement
                key={`material-files-${material.id}`}
                materialId={material.id}
                initialFiles={
                  fetchedMaterial?.Material_File || material.Material_File || []
                }
              />
            )}
            {activeTab === "files" && isLoading && (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Memuat file materi...</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
