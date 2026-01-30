"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateMaterial } from "@/lib/api/sections";
import { toast } from "sonner";
import { useFullscreenPreference } from "@/hooks/use-fullscreen-preference";
import { MaterialForm } from "./material-form";
import { isYouTubeUrl } from "@/lib/utils/youtube";

interface EditMaterialContainerProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ 
    sectionId: string; 
    materialId: string; 
    title: string; 
    content: string; 
    xp?: string;
    video_link?: string;
  }>;
}

export function EditMaterialContainer({ params, searchParams }: EditMaterialContainerProps) {
  const { id: classId } = use(params);
  const searchParamsResolved = use(searchParams);
  const { 
    sectionId: sectionIdStr, 
    materialId: materialIdStr, 
    title: initialTitle, 
    content: initialContent, 
    xp: initialXp,
    video_link: initialVideoLink
  } = searchParamsResolved;
  
  const sectionId = parseInt(sectionIdStr);
  const materialId = parseInt(materialIdStr);
  const router = useRouter();
  const { setPreference } = useFullscreenPreference();

  const [title, setTitle] = useState(decodeURIComponent(initialTitle || ""));
  const [content, setContent] = useState(decodeURIComponent(initialContent || ""));
  const [xp, setXp] = useState(initialXp ? decodeURIComponent(initialXp) : "");
  const [videoLink, setVideoLink] = useState(initialVideoLink ? decodeURIComponent(initialVideoLink) : "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load draft from sessionStorage when page loads
  useEffect(() => {
    const draftKey = `material-edit-draft-${materialId}`;
    const savedDraft = sessionStorage.getItem(draftKey);
    
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setTitle(parsed.title || decodeURIComponent(initialTitle || ""));
        setContent(parsed.content || decodeURIComponent(initialContent || ""));
        setXp(parsed.xp || (initialXp ? decodeURIComponent(initialXp) : ""));
        setVideoLink(parsed.videoLink || (initialVideoLink ? decodeURIComponent(initialVideoLink) : ""));
        sessionStorage.removeItem(draftKey);
      } catch (error) {
        console.error("Failed to parse material draft:", error);
      }
    }
  }, [materialId, initialTitle, initialContent, initialXp, initialVideoLink]);

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
    // Save draft before minimizing
    const formData = {
      title,
      content,
      xp,
      videoLink,
    };
    sessionStorage.setItem(`material-edit-draft-${materialId}`, JSON.stringify(formData));
    
    setPreference("modal");
    router.push(`/teacher/my-courses/${classId}?openEditMaterial=${materialId}&sectionId=${sectionId}`);
  };

  const handleBack = () => {
    setPreference("modal");
    router.push(`/teacher/my-courses/${classId}`);
  };

  return (
    <MaterialForm
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
    />
  );
}
