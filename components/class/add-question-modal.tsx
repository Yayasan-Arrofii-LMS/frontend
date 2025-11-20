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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createQuestion } from "@/lib/api/quizzes";
import { Maximize2, Plus, Trash2 } from "lucide-react";
import { useFullscreenPreference } from "@/hooks/use-fullscreen-preference";

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
  sectionId: number;
  quizId: number;
}

interface Answer {
  answer: string;
  is_correct: boolean;
}

export function AddQuestionModal({
  isOpen,
  onClose,
  onAdd,
  sectionId,
  quizId,
}: AddQuestionModalProps) {
  const router = useRouter();
  const { preference, setPreference } = useFullscreenPreference();
  const [question, setQuestion] = useState("");
  const [type, setType] = useState<"MultipleChoice" | "TrueFalse" | "Essay">(
    "MultipleChoice"
  );
  const [points, setPoints] = useState("5");
  const [answers, setAnswers] = useState<Answer[]>([
    { answer: "", is_correct: false },
    { answer: "", is_correct: false },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && preference === "fullscreen") {
      document.documentElement.requestFullscreen?.();
    }
  }, [isOpen, preference]);

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form
      setQuestion("");
      setType("MultipleChoice");
      setPoints("5");
      setAnswers([
        { answer: "", is_correct: false },
        { answer: "", is_correct: false },
      ]);
      onClose();
    }
  };

  const handleAddAnswer = () => {
    setAnswers([...answers, { answer: "", is_correct: false }]);
  };

  const handleRemoveAnswer = (index: number) => {
    if (answers.length > 2) {
      setAnswers(answers.filter((_, i) => i !== index));
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index].answer = value;
    setAnswers(newAnswers);
  };

  const handleCorrectChange = (index: number) => {
    const newAnswers = [...answers];
    // For multiple choice, only one can be correct
    if (type === "MultipleChoice") {
      newAnswers.forEach((ans, i) => {
        ans.is_correct = i === index;
      });
    } else {
      newAnswers[index].is_correct = !newAnswers[index].is_correct;
    }
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!question.trim()) {
      toast.error("Pertanyaan harus diisi");
      return;
    }

    const pointsValue = parseInt(points);
    if (isNaN(pointsValue) || pointsValue < 1) {
      toast.error("Poin harus minimal 1");
      return;
    }

    if (type === "MultipleChoice" || type === "TrueFalse") {
      // Validate answers
      const filledAnswers = answers.filter((ans) => ans.answer.trim() !== "");
      if (filledAnswers.length < 2) {
        toast.error("Minimal 2 jawaban harus diisi");
        return;
      }

      const hasCorrect = filledAnswers.some((ans) => ans.is_correct);
      if (!hasCorrect) {
        toast.error("Pilih minimal satu jawaban yang benar");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const questionData: any = {
        question: question.trim(),
        type,
        points: pointsValue,
      };

      // Only include answers for Multiple Choice and True/False
      if (type === "MultipleChoice" || type === "TrueFalse") {
        questionData.answers = answers
          .filter((ans) => ans.answer.trim() !== "")
          .map((ans) => ({
            answer: ans.answer.trim(),
            is_correct: ans.is_correct,
          }));
      }

      await createQuestion(sectionId, quizId, questionData);

      toast.success("Pertanyaan berhasil ditambahkan");
      onAdd();
      handleClose();
      router.refresh();
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menambahkan pertanyaan"
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Tambah Pertanyaan</DialogTitle>
              <DialogDescription>
                Tambahkan pertanyaan baru untuk quiz ini
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
              <Label htmlFor="question">
                Pertanyaan <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="question"
                placeholder="Masukkan pertanyaan"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={isSubmitting}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">
                  Tipe Pertanyaan <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={type}
                  onValueChange={(value: any) => setType(value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MultipleChoice">
                      Multiple Choice
                    </SelectItem>
                    <SelectItem value="TrueFalse">True/False</SelectItem>
                    <SelectItem value="Essay">Essay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="points">
                  Poin <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  placeholder="Contoh: 5"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {/* Answers Section - Only for Multiple Choice and True/False */}
            {(type === "MultipleChoice" || type === "TrueFalse") && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    Jawaban <span className="text-destructive">*</span>
                  </Label>
                  {type === "MultipleChoice" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddAnswer}
                      disabled={isSubmitting}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Jawaban
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  {answers.map((answer, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder={`Jawaban ${index + 1}`}
                        value={answer.answer}
                        onChange={(e) =>
                          handleAnswerChange(index, e.target.value)
                        }
                        disabled={isSubmitting}
                      />
                      <Button
                        type="button"
                        variant={answer.is_correct ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleCorrectChange(index)}
                        disabled={isSubmitting}
                      >
                        {answer.is_correct ? "✓ Benar" : "Tandai Benar"}
                      </Button>
                      {type === "MultipleChoice" && answers.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAnswer(index)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {type === "MultipleChoice"
                    ? "Pilih satu jawaban yang benar"
                    : "Tandai jawaban yang benar"}
                </p>
              </div>
            )}

            {type === "Essay" && (
              <p className="text-sm text-muted-foreground">
                Pertanyaan essay akan dinilai secara manual oleh pengajar.
              </p>
            )}
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
              {isSubmitting ? "Menambahkan..." : "Tambah Pertanyaan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
