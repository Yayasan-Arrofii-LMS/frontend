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
import { createQuiz, createQuestion } from "@/lib/api/quizzes";
import { Maximize2, Plus, Trash2, MinusCircle } from "lucide-react";
import { useFullscreenPreference } from "@/hooks/use-fullscreen-preference";
import { Card, CardContent } from "@/components/ui/card";

interface Choice {
  id: string;
  text: string;
  label: string;
}

interface QuestionData {
  id: string;
  question: string;
  choices: Choice[];
  correctAnswer: string;
  points: number;
}

interface AddQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
  classId: string;
  sectionId: number;
  basePath?: string;
}

const CHOICE_LABELS = ["A", "B", "C", "D", "E"];

export function AddQuizModal({
  isOpen,
  onClose,
  onAdd,
  classId,
  sectionId,
  basePath = "/course",
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
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize with one empty question
  useEffect(() => {
    if (isOpen && questions.length === 0) {
      addQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const addQuestion = () => {
    const newQuestion: QuestionData = {
      id: Math.random().toString(36).substr(2, 9),
      question: "",
      choices: [
        { id: "0", text: "", label: "A" },
        { id: "1", text: "", label: "B" },
        { id: "2", text: "", label: "C" },
        { id: "3", text: "", label: "D" },
      ],
      correctAnswer: "0",
      points: 10,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (questionId: string) => {
    if (questions.length === 1) {
      toast.error("Minimal harus ada 1 pertanyaan");
      return;
    }
    setQuestions(questions.filter((q) => q.id !== questionId));
  };

  const updateQuestion = (questionId: string, field: string, value: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, [field]: value } : q
      )
    );
  };

  const updateChoice = (questionId: string, choiceId: string, text: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              choices: q.choices.map((c) =>
                c.id === choiceId ? { ...c, text } : c
              ),
            }
          : q
      )
    );
  };

  const addChoice = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.choices.length < 5) {
          const newChoice: Choice = {
            id: q.choices.length.toString(),
            text: "",
            label: CHOICE_LABELS[q.choices.length],
          };
          return { ...q, choices: [...q.choices, newChoice] };
        }
        return q;
      })
    );
  };

  const removeChoice = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.choices.length > 2) {
          const newChoices = q.choices.slice(0, -1);
          // Reset correct answer if it was the removed choice
          const correctAnswer =
            q.correctAnswer === (q.choices.length - 1).toString()
              ? "0"
              : q.correctAnswer;
          return { ...q, choices: newChoices, correctAnswer };
        }
        return q;
      })
    );
  };

  useEffect(() => {
    if (isOpen && preference === "fullscreen") {
      onClose();
      router.push(`${basePath}/${classId}/quiz/add?sectionId=${sectionId}`);
    }
  }, [isOpen, preference, classId, sectionId, basePath, onClose, router]);

  const handleExpand = () => {
    setPreference("fullscreen");
    onClose();
    router.push(`${basePath}/${classId}/quiz/add?sectionId=${sectionId}`);
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

    // Validate questions
    if (questions.length === 0) {
      toast.error("Minimal harus ada 1 pertanyaan");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error(`Pertanyaan ${i + 1}: Pertanyaan wajib diisi`);
        return;
      }
      
      const emptyChoices = q.choices.filter(c => !c.text.trim());
      if (emptyChoices.length > 0) {
        toast.error(`Pertanyaan ${i + 1}: Semua pilihan jawaban harus diisi`);
        return;
      }

      if (!q.correctAnswer && q.correctAnswer !== "0") {
        toast.error(`Pertanyaan ${i + 1}: Pilih jawaban yang benar`);
        return;
      }
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
      // Create quiz first
      const quiz = await createQuiz(sectionId, {
        title: title.trim(),
        description: description.trim(),
        max_attempts: maxAttemptsNum,
        time_limit: timeLimitNum,
        open_at: new Date(openAt).toISOString(),
        close_at: new Date(closeAt).toISOString(),
        passing_grade: passingGradeNum,
        xp: xpNum,
      });

      // Create all questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const correctAnswerIndex = parseInt(q.correctAnswer);
        
        // Convert choices to answers format
        const answers = q.choices.map((choice, index) => ({
          answer: choice.text.trim(),
          is_correct: index === correctAnswerIndex,
        }));

        await createQuestion(sectionId, quiz.id, {
          question: q.question.trim(),
          type: "MultipleChoice",
          points: q.points,
          answers: answers,
        });
      }

      toast.success("Quiz dan pertanyaan berhasil ditambahkan");
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
      setQuestions([]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
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
                  Buat quiz baru beserta pertanyaan-pertanyaannya.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1 flex-1">
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

            {/* Questions Section */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Pertanyaan</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addQuestion}
                  disabled={isSubmitting}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Pertanyaan
                </Button>
              </div>

              {questions.map((question, qIndex) => (
                <Card key={question.id} className="relative">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`question-${question.id}`}>
                          Pertanyaan {qIndex + 1} <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id={`question-${question.id}`}
                          placeholder="Masukkan pertanyaan..."
                          value={question.question}
                          onChange={(e) =>
                            updateQuestion(question.id, "question", e.target.value)
                          }
                          disabled={isSubmitting}
                          rows={2}
                        />
                      </div>
                      {questions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(question.id)}
                          disabled={isSubmitting}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Pilihan Jawaban</Label>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeChoice(question.id)}
                            disabled={isSubmitting || question.choices.length <= 2}
                            title="Kurangi pilihan"
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => addChoice(question.id)}
                            disabled={isSubmitting || question.choices.length >= 5}
                            title="Tambah pilihan"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {question.choices.map((choice) => (
                        <div key={choice.id} className="flex items-center gap-2">
                          <input
                            type="radio"
                            id={`correct-${question.id}-${choice.id}`}
                            name={`correct-${question.id}`}
                            checked={question.correctAnswer === choice.id}
                            onChange={() =>
                              updateQuestion(question.id, "correctAnswer", choice.id)
                            }
                            disabled={isSubmitting}
                            className="h-4 w-4"
                          />
                          <Label
                            htmlFor={`correct-${question.id}-${choice.id}`}
                            className="font-semibold min-w-[24px]"
                          >
                            {choice.label}.
                          </Label>
                          <Input
                            placeholder={`Pilihan ${choice.label}`}
                            value={choice.text}
                            onChange={(e) =>
                              updateChoice(question.id, choice.id, e.target.value)
                            }
                            disabled={isSubmitting}
                            className="flex-1"
                          />
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground">
                        Pilih radio button untuk menandai jawaban yang benar
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`points-${question.id}`}>Poin</Label>
                      <Input
                        id={`points-${question.id}`}
                        type="number"
                        min="1"
                        value={question.points}
                        onChange={(e) =>
                          updateQuestion(question.id, "points", e.target.value)
                        }
                        disabled={isSubmitting}
                        className="w-24"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
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
