"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createQuiz } from "@/lib/api/quizzes";
import { toast } from "sonner";
import { ArrowLeft, Minimize2 } from "lucide-react";
import { useFullscreenPreference } from "@/hooks/use-fullscreen-preference";

export default function AddQuizPage({
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
  const [description, setDescription] = useState("");
  const [maxAttempts, setMaxAttempts] = useState("3");
  const [timeLimit, setTimeLimit] = useState("60");
  const [openAt, setOpenAt] = useState("");
  const [closeAt, setCloseAt] = useState("");
  const [passingGrade, setPassingGrade] = useState("70");
  const [xp, setXp] = useState("10");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Judul quiz wajib diisi");
      return;
    }

    if (!description.trim()) {
      toast.error("Deskripsi quiz wajib diisi");
      return;
    }

    const maxAttemptsNum = parseInt(maxAttempts);
    if (isNaN(maxAttemptsNum) || maxAttemptsNum < 1) {
      toast.error("Max attempts minimal 1");
      return;
    }

    const timeLimitNum = parseInt(timeLimit);
    if (isNaN(timeLimitNum) || timeLimitNum < 1) {
      toast.error("Time limit minimal 1 menit");
      return;
    }

    if (!openAt) {
      toast.error("Tanggal buka quiz wajib diisi");
      return;
    }

    if (!closeAt) {
      toast.error("Tanggal tutup quiz wajib diisi");
      return;
    }

    if (new Date(closeAt) <= new Date(openAt)) {
      toast.error("Tanggal tutup harus setelah tanggal buka");
      return;
    }

    const passingGradeNum = parseInt(passingGrade);
    if (
      isNaN(passingGradeNum) ||
      passingGradeNum < 0 ||
      passingGradeNum > 100
    ) {
      toast.error("Passing grade harus antara 0-100");
      return;
    }

    const xpNum = parseInt(xp);
    if (isNaN(xpNum) || xpNum < 0) {
      toast.error("XP harus berupa angka positif");
      return;
    }

    setIsSubmitting(true);
    try {
      await createQuiz(sectionId, {
        title: title.trim(),
        description: description.trim(),
        max_attempts: maxAttemptsNum,
        time_limit: timeLimitNum,
        open_at: new Date(openAt).toISOString(),
        close_at: new Date(closeAt).toISOString(),
        passing_grade: passingGradeNum,
        xp: xpNum,
      });

      toast.success("Quiz berhasil ditambahkan");
      setPreference("modal");
      router.push(`/course/${classId}`);
      router.refresh();
    } catch (error) {
      toast.error("Gagal menambahkan quiz");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMinimize = () => {
    setPreference("modal");
    router.push(`/course/${classId}?openAddQuiz=${sectionId}`);
  };

  const handleBack = () => {
    setPreference("modal");
    router.push(`/course/${classId}`);
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
              <h1 className="text-2xl font-semibold">Tambah Quiz Baru</h1>
              <p className="text-sm text-muted-foreground">
                Mode Fullscreen - Buat quiz dengan mudah
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
            <Label htmlFor="quiz-title">
              Judul Quiz <span className="text-destructive">*</span>
            </Label>
            <Input
              id="quiz-title"
              placeholder="Contoh: Kuis Bab 1 - Pengenalan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              autoFocus
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quiz-description">
              Deskripsi <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="quiz-description"
              placeholder="Jelaskan tentang quiz ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={6}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="max-attempts">
                Max Attempts <span className="text-destructive">*</span>
              </Label>
              <Input
                id="max-attempts"
                type="number"
                min="1"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time-limit">
                Waktu (menit) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="time-limit"
                type="number"
                min="1"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="open-at">
                Dibuka pada <span className="text-destructive">*</span>
              </Label>
              <Input
                id="open-at"
                type="datetime-local"
                value={openAt}
                onChange={(e) => setOpenAt(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="close-at">
                Ditutup pada <span className="text-destructive">*</span>
              </Label>
              <Input
                id="close-at"
                type="datetime-local"
                value={closeAt}
                onChange={(e) => setCloseAt(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="passing-grade">
                Passing Grade (%) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="passing-grade"
                type="number"
                min="0"
                max="100"
                value={passingGrade}
                onChange={(e) => setPassingGrade(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="xp">
                XP Reward <span className="text-destructive">*</span>
              </Label>
              <Input
                id="xp"
                type="number"
                min="0"
                value={xp}
                onChange={(e) => setXp(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
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
              {isSubmitting ? "Menyimpan..." : "Tambah Quiz"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
