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
import { createQuiz } from "@/lib/api/quizzes";
import { Maximize2 } from "lucide-react";
import { useFullscreenPreference } from "@/hooks/use-fullscreen-preference";

interface AddQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
  classId: string;
  sectionId: number;
}

export function AddQuizModal({
  isOpen,
  onClose,
  onAdd,
  classId,
  sectionId,
}: AddQuizModalProps) {
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

  useEffect(() => {
    if (isOpen && preference === "fullscreen") {
      onClose();
      router.push(`/class/${classId}/quiz/add?sectionId=${sectionId}`);
    }
  }, [isOpen, preference, classId, sectionId, onClose, router]);

  const handleExpand = () => {
    setPreference("fullscreen");
    onClose();
    router.push(`/class/${classId}/quiz/add?sectionId=${sectionId}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
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
      onAdd();
      handleClose();
    } catch (error) {
      toast.error("Gagal menambahkan quiz");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle("");
      setDescription("");
      setMaxAttempts("3");
      setTimeLimit("60");
      setOpenAt("");
      setCloseAt("");
      setPassingGrade("70");
      setXp("10");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
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
                <DialogTitle>Tambah Quiz Baru</DialogTitle>
                <DialogDescription>
                  Buat quiz baru untuk section ini. Anda bisa menambah pertanyaan
                  setelah quiz dibuat.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
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
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="xp">XP Reward</Label>
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
              {isSubmitting ? "Menyimpan..." : "Tambah Quiz"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddQuizModal;
