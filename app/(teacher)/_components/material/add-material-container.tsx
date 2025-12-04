"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { createMaterial } from "@/lib/api/sections";
import { createMaterialFile } from "@/lib/api/material-files";
import { toast } from "sonner";
import { useFullscreenPreference } from "@/hooks/use-fullscreen-preference";
import { MaterialFormWithTabs, StagedFile } from "./material-form-with-tabs";

interface AddMaterialContainerProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sectionId: string }>;
}

export function AddMaterialContainer({
  params,
  searchParams,
}: AddMaterialContainerProps) {
  const { id: classId } = use(params);
  const { sectionId: sectionIdStr } = use(searchParams);
  const sectionId = parseInt(sectionIdStr);
  const router = useRouter();
  const { setPreference } = useFullscreenPreference();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [xp, setXp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdMaterialId, setCreatedMaterialId] = useState<number | null>(
    null
  );

  const handleSubmit = async (
    e: React.FormEvent,
    stagedFiles?: StagedFile[]
  ) => {
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
      const newMaterial = await createMaterial(classId, sectionId, {
        title: title.trim(),
        content: content.trim(),
        xp: xpValue,
      });
      setCreatedMaterialId(newMaterial.id);

      // Upload staged files if any
      if (stagedFiles && stagedFiles.length > 0) {
        let successCount = 0;
        let failCount = 0;

        for (const stagedFile of stagedFiles) {
          try {
            const formData = new FormData();
            formData.append('file', stagedFile.file);
            formData.append('title', stagedFile.title);
            
            await createMaterialFile(newMaterial.id, formData);
            successCount++;
          } catch (error) {
            console.error("Failed to upload file:", stagedFile.title, error);
            failCount++;
          }
        }

        if (failCount === 0) {
          toast.success(
            `Materi berhasil ditambahkan dengan ${successCount} file.`
          );
        } else {
          toast.warning(
            `Materi berhasil ditambahkan. ${successCount} file berhasil diupload, ${failCount} file gagal.`
          );
        }
      } else {
        toast.success(
          "Materi berhasil ditambahkan. Anda dapat menambahkan file sekarang."
        );
      }
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
    <MaterialFormWithTabs
      mode={createdMaterialId ? "edit" : "add"}
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
      classId={classId}
      sectionId={sectionId}
      materialId={createdMaterialId || undefined}
      defaultTab={createdMaterialId ? "files" : "content"}
    />
  );
}
