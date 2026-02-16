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
import { createMaterial } from "@/lib/api/sections";
import { CreateMaterialInput } from "@/types/section";
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
  const [materialFiles, setMaterialFiles] = useState<
    { file: File; title: string }[]
  >([]);

  // Load draft from sessionStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      const draftKey = `material-draft-${sectionId}`;
      const savedDraft = sessionStorage.getItem(draftKey);

      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setTitle(parsed.title || "");
          setContent(parsed.content || "");
          setXp(parsed.xp || "");
          setVideoLink(parsed.videoLink || "");
          // Note: Files cannot be restored from sessionStorage
          setMaterialFiles([]);
          // Clear the draft after loading
          sessionStorage.removeItem(draftKey);
        } catch (error) {
          console.error("Failed to parse material draft:", error);
        }
      }
    }
  }, [isOpen, sectionId]);

  const handleExpand = () => {
    // Save draft before expanding
    const formData = {
      title,
      content,
      xp,
      videoLink,
      // Note: materialFiles (File objects) cannot be serialized to sessionStorage
      // User will need to re-add files in fullscreen mode
    };
    sessionStorage.setItem(
      `material-draft-${sectionId}`,
      JSON.stringify(formData),
    );

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
      // Step 1: Create material first
      const materialData: CreateMaterialInput = {
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

      const newMaterial = await createMaterial(
        classId,
        sectionId,
        materialData,
      );

      // Step 2: Upload files if any
      if (materialFiles.length > 0) {
        const { createMaterialFile } = await import("@/lib/api/material-files");

        let successCount = 0;
        let failCount = 0;

        for (const item of materialFiles) {
          try {
            const formData = new FormData();
            formData.append("file", item.file);
            formData.append("title", item.title || item.file.name);

            await createMaterialFile(newMaterial.id, formData);
            successCount++;
          } catch (error) {
            console.error(`Failed to upload file ${item.file.name}:`, error);
            failCount++;
          }
        }

        if (failCount > 0) {
          toast.warning(
            `Materi berhasil ditambahkan. ${successCount} file berhasil diupload, ${failCount} file gagal.`,
          );
        } else {
          toast.success(`Materi dan ${successCount} file berhasil ditambahkan`);
        }
      } else {
        toast.success("Materi berhasil ditambahkan");
      }

      // Refresh data and close modal
      await onAdd();
      handleClose();
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
      setMaterialFiles([]);
      setActiveTab("content");
      onClose();
    }
  };

  const handleAddFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).map((file) => ({
      file,
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
    }));
    setMaterialFiles((prev) => [...prev, ...newFiles]);
    toast.success(`${newFiles.length} file ditambahkan`);
  };

  const handleUpdateFileTitle = (index: number, title: string) => {
    setMaterialFiles((prev) =>
      prev.map((item, i) => (i === index ? { ...item, title } : item)),
    );
  };

  const handleRemoveFile = (index: number) => {
    setMaterialFiles((prev) => prev.filter((_, i) => i !== index));
    toast.success("File dihapus");
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
                Isi konten materi dan tambahkan file jika diperlukan.
                {materialFiles.length > 0 && (
                  <span className="text-primary font-medium">
                    {" "}
                    ({materialFiles.length} file siap diupload)
                  </span>
                )}
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
              File Materi{" "}
              {materialFiles.length > 0 && `(${materialFiles.length})`}
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
                    disabled={isSubmitting}
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
                  <Label htmlFor="material-xp">XP Reward (Opsional)</Label>
                  <Input
                    id="material-xp"
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
                  <Label htmlFor="material-video-link">
                    Link Video YouTube (Opsional)
                  </Label>
                  <Input
                    id="material-video-link"
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
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Materi"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="files" className="flex-1 overflow-y-auto mt-4">
            <div className="space-y-4 px-1">
              <div className="space-y-2">
                <Label htmlFor="material-files">Tambah File (Opsional)</Label>
                <Input
                  id="material-files"
                  type="file"
                  multiple
                  onChange={(e) => handleAddFiles(e.target.files)}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  File akan diupload setelah materi berhasil dibuat. Anda bisa
                  menambahkan beberapa file sekaligus.
                </p>
              </div>

              {materialFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>
                    File yang akan diupload ({materialFiles.length})
                  </Label>
                  <div className="space-y-3">
                    {materialFiles.map((item, index) => (
                      <div
                        key={index}
                        className="border rounded-md p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <svg
                              className="h-4 w-4 text-muted-foreground shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {item.file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(item.file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(index)}
                            disabled={isSubmitting}
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <Label
                            htmlFor={`file-title-${index}`}
                            className="text-xs"
                          >
                            Judul File
                          </Label>
                          <Input
                            id={`file-title-${index}`}
                            placeholder="Masukkan judul file"
                            value={item.title}
                            onChange={(e) =>
                              handleUpdateFileTitle(index, e.target.value)
                            }
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
