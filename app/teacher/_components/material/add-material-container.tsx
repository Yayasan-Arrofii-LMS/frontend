"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { createMaterial } from "@/lib/api/sections";
import { toast } from "sonner";
import { useFullscreenPreference } from "@/hooks/use-fullscreen-preference";
import { MaterialForm } from "./material-form";
import { isYouTubeUrl } from "@/lib/utils/youtube";

interface AddMaterialContainerProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sectionId: string }>;
}

export function AddMaterialContainer({ params, searchParams }: AddMaterialContainerProps) {
  const { id: classId } = use(params);
  const { sectionId: sectionIdStr } = use(searchParams);
  const sectionId = parseInt(sectionIdStr);
  const router = useRouter();
  const { setPreference } = useFullscreenPreference();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [xp, setXp] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await createMaterial(classId, sectionId, {
        title: title.trim(),
        content: content.trim(),
        xp: xpValue,
        video_link: videoLink.trim() || undefined,
      });
      toast.success("Materi berhasil ditambahkan");
      setPreference("modal");
      router.push(`/teacher/my-courses/${classId}`);
      router.refresh();
    } catch {
      toast.error("Gagal menambahkan materi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMinimize = () => {
    setPreference("modal");
    router.push(`/teacher/my-courses/${classId}?openAddMaterial=${sectionId}`);
  };

  const handleBack = () => {
    setPreference("modal");
    router.push(`/teacher/my-courses/${classId}`);
  };

  return (
    <MaterialForm
      mode="add"
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
