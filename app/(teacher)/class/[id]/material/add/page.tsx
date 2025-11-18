"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createMaterial } from "@/lib/api/sections";
import { toast } from "sonner";
import { ArrowLeft, Minimize2 } from "lucide-react";
import { useFullscreenPreference } from "@/hooks/use-fullscreen-preference";

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
      router.push(`/class/${classId}`);
      router.refresh();
    } catch {
      toast.error("Gagal menambahkan materi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMinimize = () => {
    setPreference("modal");
    router.push(`/class/${classId}?openAddMaterial=${sectionId}`);
  };

  const handleBack = () => {
    setPreference("modal");
    router.push(`/class/${classId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">Tambah Materi Baru</h1>
              <p className="text-sm text-muted-foreground">
                Mode Fullscreen - Lebih banyak ruang untuk menulis
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleMinimize}
            title="Kembali ke modal"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="text-lg"
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
              disabled={isSubmitting}
              rows={20}
              className="font-mono"
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
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              XP yang didapat siswa setelah menyelesaikan materi ini
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Tambah Materi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
