"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { createMaterial } from "@/lib/api/sections";
import { toast } from "sonner";
import { useFullscreenPreference } from "@/hooks/use-fullscreen-preference";
import { MaterialForm } from "@/app/(teacher)/_components/material/material-form";
import { useState } from "react";

export default function AddMaterialPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sectionId: string }>;
}) {
  const { id: classId } = use(params);
  const { sectionId: sectionIdStr } = use(searchParams);
  const sectionId = parseInt(sectionIdStr);
  const router = useRouter();
  const { setPreference } = useFullscreenPreference();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [xp, setXp] = useState("");
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

    setIsSubmitting(true);
    try {
      await createMaterial(classId, sectionId, {
        title: title.trim(),
        content: content.trim(),
        xp: xpValue,
      });
      toast.success("Materi berhasil ditambahkan");
      setPreference("modal");
      router.push(`/course/${classId}`);
      router.refresh();
    } catch {
      toast.error("Gagal menambahkan materi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMinimize = () => {
    setPreference("modal");
    router.push(`/course/${classId}?openAddMaterial=${sectionId}`);
  };

  const handleBack = () => {
    setPreference("modal");
    router.push(`/course/${classId}`);
  };

  return (
    <MaterialForm
      mode="add"
      title={title}
      content={content}
      xp={xp}
      isSubmitting={isSubmitting}
      onTitleChange={setTitle}
      onContentChange={setContent}
      onXpChange={setXp}
      onSubmit={handleSubmit}
      onMinimize={handleMinimize}
      onBack={handleBack}
    />
  );
}
