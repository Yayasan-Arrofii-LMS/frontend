"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateMaterial, getMaterial } from "@/lib/api/sections";
import { toast } from "sonner";
import { useFullscreenPreference } from "@/hooks/use-fullscreen-preference";
import { MaterialFormWithTabs } from "./material-form-with-tabs";
import { Material } from "@/types/section";

interface EditMaterialContainerProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    sectionId: string;
    materialId: string;
    title: string;
    content: string;
    xp?: string;
    openFilesTab?: string;
  }>;
}

export function EditMaterialContainer({
  params,
  searchParams,
}: EditMaterialContainerProps) {
  const { id: classId } = use(params);
  const searchParamsResolved = use(searchParams);
  const {
    sectionId: sectionIdStr,
    materialId: materialIdStr,
    title: initialTitle,
    content: initialContent,
    xp: initialXp,
    openFilesTab,
  } = searchParamsResolved;

  const sectionId = parseInt(sectionIdStr);
  const materialId = parseInt(materialIdStr);
  const router = useRouter();
  const { setPreference } = useFullscreenPreference();

  const [title, setTitle] = useState(decodeURIComponent(initialTitle || ""));
  const [content, setContent] = useState(
    decodeURIComponent(initialContent || "")
  );
  const [xp, setXp] = useState(initialXp ? decodeURIComponent(initialXp) : "");
  const [videoLink, setVideoLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchedMaterial, setFetchedMaterial] = useState<Material | null>(null);
  const defaultTab = openFilesTab === "true" ? "files" : "content";

  // Fetch material data from API
  useEffect(() => {
    const fetchMaterialData = async () => {
      try {
        setIsLoading(true);
        const data = await getMaterial(sectionId, materialId);
        setFetchedMaterial(data);
        setTitle(data.title);
        setContent(data.content);
        setXp(data.xp?.toString() || "");
        setVideoLink(data.video_link || "");
      } catch (error) {
        console.error("Failed to fetch material:", error);
        toast.error("Gagal memuat data materi");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterialData();
  }, [sectionId, materialId]);

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

    setIsSubmitting(true);
    try {
      await updateMaterial(classId, sectionId, materialId, {
        title: title.trim(),
        content: content.trim(),
        xp: xpValue,
        video_link: videoLink.trim() || undefined,
      });
      toast.success("Materi berhasil diperbarui");
      setPreference("modal");
      router.push(`/teacher/my-courses/${classId}`);
      router.refresh();
    } catch {
      toast.error("Gagal memperbarui materi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMinimize = () => {
    setPreference("modal");
    router.push(
      `/teacher/my-courses/${classId}?openEditMaterial=${materialId}&sectionId=${sectionId}`
    );
  };

  const handleBack = () => {
    setPreference("modal");
    router.push(`/teacher/my-courses/${classId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Memuat data materi...</p>
      </div>
    );
  }

  return (
    <MaterialFormWithTabs
      mode="edit"
      title={title}
      content={content}
      xp={xp}
      videoLink={videoLink}
      isSubmitting={isSubmitting}
      onTitleChange={setTitle}
      onContentChange={setContent}
      onXpChange={setXp}
      onVideoLinkChange={setVideoLink}
      onSubmit={handleSubmit}
      onMinimize={handleMinimize}
      onBack={handleBack}
      classId={classId}
      sectionId={sectionId}
      materialId={materialId}
      defaultTab={defaultTab}
      initialMaterialFiles={fetchedMaterial?.Material_File || []}
    />
  );
}
