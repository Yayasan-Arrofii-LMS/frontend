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
import { toast } from "sonner";
import { updateQuiz } from "@/lib/api/quizzes";
import { Maximize2 } from "lucide-react";
import { useFullscreenPreference } from "@/hooks/use-fullscreen-preference";

interface Quiz {
  id: number;
  title: string;
  description: string;
  max_attempts: number;
  time_limit: number;
  open_at: string;
  close_at: string;
  passing_grade: number;
  xp: number;
}

interface EditQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  classId: string;
  sectionId: number;
  quiz: Quiz | null;
}

export function EditQuizModal({
  isOpen,
  onClose,
  onUpdate,
  classId,
  sectionId,
  quiz,
}: EditQuizModalProps) {
  const router = useRouter();
  const { preference, setPreference } = useFullscreenPreference();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxAttempts, setMaxAttempts] = useState("3");
  const [timeLimit, setTimeLimit] = useState("60");
  const [openAt, setOpenAt] = useState("");
  const [closeAt, setCloseAt] = useState("");
  const [passingGrade, setPassingGrade] = useState("70");
  const [xp, setXp] = useState("10");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set initial values when quiz changes
  useEffect(() => {
    if (quiz) {
      setTitle(quiz.title);
      setDescription(quiz.description);
      setMaxAttempts(quiz.max_attempts.toString());
      setTimeLimit(quiz.time_limit.toString());

      // Format datetime for input
      const formatDateTimeLocal = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setOpenAt(formatDateTimeLocal(quiz.open_at));
      setCloseAt(formatDateTimeLocal(quiz.close_at));
      setPassingGrade(quiz.passing_grade.toString());
      setXp(quiz.xp.toString());
    }
  }, [quiz]);

  useEffect(() => {
    if (isOpen && preference === "fullscreen") {
      document.documentElement.requestFullscreen?.();
    }
  }, [isOpen, preference]);

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quiz) return;

    // Validations
    if (!title.trim()) {
      toast.error("Judul quiz harus diisi");
      return;
    }

    if (!description.trim()) {
      toast.error("Deskripsi quiz harus diisi");
      return;
    }

    if (!openAt || !closeAt) {
      toast.error("Waktu buka dan tutup quiz harus diisi");
      return;
    }

    const openDate = new Date(openAt);
    const closeDate = new Date(closeAt);

    if (closeDate <= openDate) {
      toast.error("Waktu tutup harus setelah waktu buka");
      return;
    }

    const attempts = parseInt(maxAttempts);
    const time = parseInt(timeLimit);
    const grade = parseInt(passingGrade);
    const xpValue = parseInt(xp);

    if (isNaN(attempts) || attempts < 1) {
      toast.error("Jumlah percobaan harus minimal 1");
      return;
    }

    if (isNaN(time) || time < 1) {
      toast.error("Batas waktu harus minimal 1 menit");
      return;
    }

    if (isNaN(grade) || grade < 0 || grade > 100) {
      toast.error("Nilai kelulusan harus antara 0-100");
      return;
    }

    if (isNaN(xpValue) || xpValue < 0) {
      toast.error("XP harus berupa angka positif");
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        title: title.trim(),
        description: description.trim(),
        max_attempts: attempts,
        time_limit: time,
        open_at: openDate.toISOString(),
        close_at: closeDate.toISOString(),
        passing_grade: grade,
        xp: xpValue,
      };

      console.log("Updating quiz with data:", updateData);
      console.log("Section ID:", sectionId, "Quiz ID:", quiz.id);

      await updateQuiz(sectionId, quiz.id, updateData);

      toast.success("Quiz berhasil diperbarui");
      onUpdate();
      handleClose();

      // Refresh data
      router.refresh();
    } catch (error) {
      console.error("Error updating quiz:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal memperbarui quiz"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFullscreen = () => {
    const newPreference = preference === "fullscreen" ? "modal" : "fullscreen";
    setPreference(newPreference);

    if (newPreference === "fullscreen") {
      document.documentElement.requestFullscreen?.();
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
  };

  if (!quiz) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Edit Quiz</DialogTitle>
              <DialogDescription>
                Ubah informasi quiz untuk section ini
              </DialogDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="h-8 w-8"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Judul Quiz <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Masukkan judul quiz"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Deskripsi <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Masukkan deskripsi quiz"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxAttempts">
                  Jumlah Percobaan <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  min="1"
                  placeholder="Contoh: 3"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeLimit">
                  Batas Waktu (menit){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="1"
                  placeholder="Contoh: 60"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openAt">
                  Waktu Buka <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="openAt"
                  type="datetime-local"
                  value={openAt}
                  onChange={(e) => setOpenAt(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="closeAt">
                  Waktu Tutup <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="closeAt"
                  type="datetime-local"
                  value={closeAt}
                  onChange={(e) => setCloseAt(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passingGrade">
                  Nilai Kelulusan (0-100){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="passingGrade"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Contoh: 70"
                  value={passingGrade}
                  onChange={(e) => setPassingGrade(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="xp">
                  XP <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="xp"
                  type="number"
                  min="0"
                  placeholder="Contoh: 10"
                  value={xp}
                  onChange={(e) => setXp(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
