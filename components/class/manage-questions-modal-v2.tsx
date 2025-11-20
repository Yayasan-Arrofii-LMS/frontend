"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  fetchQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "@/lib/api/quizzes";
import { Question, Answer } from "@/types/section";
import { Plus, Trash2, Save, X, GripVertical } from "lucide-react";
import { useRouter } from "next/navigation";

interface ManageQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: number;
  quizId: number;
  quizTitle: string;
}

interface QuestionForm {
  id?: number; // If exists, it's an edit, else it's new
  question: string;
  type: "MultipleChoice" | "TrueFalse" | "Essay";
  points: string;
  answers: {
    id?: number;
    answer: string;
    is_correct: boolean;
  }[];
  isNew: boolean;
  isModified: boolean;
}

export function ManageQuestionsModal({
  isOpen,
  onClose,
  sectionId,
  quizId,
  quizTitle,
}: ManageQuestionsModalProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchQuestions(sectionId, quizId);
      const formattedQuestions: QuestionForm[] = data.map((q) => ({
        id: q.id,
        question: q.question,
        type: q.type,
        points: q.points.toString(),
        answers:
          q.Answer?.map((a) => ({
            id: a.id,
            answer: a.answer,
            is_correct: a.is_correct,
          })) || [],
        isNew: false,
        isModified: false,
      }));
      setQuestions(formattedQuestions);
    } catch (error) {
      console.error("Error loading questions:", error);
      toast.error("Gagal memuat pertanyaan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadQuestions();
    }
  }, [isOpen, sectionId, quizId]);

  const addNewQuestion = () => {
    const newQuestion: QuestionForm = {
      question: "",
      type: "MultipleChoice",
      points: "5",
      answers: [
        { answer: "", is_correct: false },
        { answer: "", is_correct: false },
      ],
      isNew: true,
      isModified: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = async (index: number) => {
    const question = questions[index];

    if (question.id) {
      // Existing question - delete from backend
      if (!confirm("Hapus pertanyaan ini?")) return;

      setDeletingIds(new Set(deletingIds).add(question.id));
      try {
        await deleteQuestion(sectionId, quizId, question.id);
        toast.success("Pertanyaan berhasil dihapus");
        setQuestions(questions.filter((_, i) => i !== index));
      } catch (error) {
        toast.error("Gagal menghapus pertanyaan");
      } finally {
        const newDeletingIds = new Set(deletingIds);
        newDeletingIds.delete(question.id!);
        setDeletingIds(newDeletingIds);
      }
    } else {
      // New question - just remove from list
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestionField = (
    index: number,
    field: keyof QuestionForm,
    value: any
  ) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value,
      isModified: !newQuestions[index].isNew,
    };
    setQuestions(newQuestions);
  };

  const addAnswer = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].answers.push({
      answer: "",
      is_correct: false,
    });
    newQuestions[questionIndex].isModified = !newQuestions[questionIndex].isNew;
    setQuestions(newQuestions);
  };

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].answers.length > 2) {
      newQuestions[questionIndex].answers.splice(answerIndex, 1);
      newQuestions[questionIndex].isModified =
        !newQuestions[questionIndex].isNew;
      setQuestions(newQuestions);
    }
  };

  const updateAnswer = (
    questionIndex: number,
    answerIndex: number,
    field: string,
    value: any
  ) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].answers[answerIndex] = {
      ...newQuestions[questionIndex].answers[answerIndex],
      [field]: value,
    };
    newQuestions[questionIndex].isModified = !newQuestions[questionIndex].isNew;
    setQuestions(newQuestions);
  };

  const setCorrectAnswer = (questionIndex: number, answerIndex: number) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];

    if (question.type === "MultipleChoice") {
      // Only one correct answer
      question.answers.forEach((ans, i) => {
        ans.is_correct = i === answerIndex;
      });
    } else {
      // Toggle for True/False
      question.answers[answerIndex].is_correct =
        !question.answers[answerIndex].is_correct;
    }

    question.isModified = !question.isNew;
    setQuestions(newQuestions);
  };

  const validateAndSave = async () => {
    // Validate all questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      if (!q.question.trim()) {
        toast.error(`Pertanyaan #${i + 1}: Pertanyaan harus diisi`);
        return;
      }

      const points = parseInt(q.points);
      if (isNaN(points) || points < 1) {
        toast.error(`Pertanyaan #${i + 1}: Poin harus minimal 1`);
        return;
      }

      if (q.type !== "Essay") {
        const filledAnswers = q.answers.filter((a) => a.answer.trim());
        if (filledAnswers.length < 2) {
          toast.error(`Pertanyaan #${i + 1}: Minimal 2 jawaban harus diisi`);
          return;
        }

        if (!filledAnswers.some((a) => a.is_correct)) {
          toast.error(
            `Pertanyaan #${i + 1}: Pilih minimal satu jawaban yang benar`
          );
          return;
        }
      }
    }

    setIsSaving(true);
    try {
      // Save new and modified questions
      for (const q of questions) {
        if (q.isNew) {
          // Create new question
          const questionData: any = {
            question: q.question.trim(),
            type: q.type,
            points: parseInt(q.points),
          };

          if (q.type !== "Essay") {
            questionData.answers = q.answers
              .filter((a) => a.answer.trim())
              .map((a) => ({
                answer: a.answer.trim(),
                is_correct: a.is_correct,
              }));
          }

          await createQuestion(sectionId, quizId, questionData);
        } else if (q.isModified && q.id) {
          // Update existing question
          const questionData: any = {
            question: q.question.trim(),
            type: q.type,
            points: parseInt(q.points),
          };

          if (q.type !== "Essay") {
            questionData.answers = q.answers
              .filter((a) => a.answer.trim())
              .map((a) => ({
                answer: a.answer.trim(),
                is_correct: a.is_correct,
              }));
          }

          await updateQuestion(sectionId, q.id, questionData);
        }
      }

      toast.success("Semua pertanyaan berhasil disimpan");
      router.refresh();
      onClose();
    } catch (error) {
      console.error("Error saving questions:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menyimpan pertanyaan"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = questions.some((q) => q.isNew || q.isModified);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl">Kelola Pertanyaan</DialogTitle>
          <DialogDescription className="text-base">
            {quizTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          <div className="space-y-4 py-4">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Memuat pertanyaan...
              </div>
            ) : (
              <>
                {/* Questions List */}
                <div className="space-y-4">
                  {questions.map((question, qIndex) => (
                    <Card
                      key={qIndex}
                      className={`${
                        question.isNew
                          ? "border-primary"
                          : question.isModified
                          ? "border-yellow-500"
                          : ""
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-lg">
                              Pertanyaan #{qIndex + 1}
                              {question.isNew && (
                                <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                                  Baru
                                </span>
                              )}
                              {question.isModified && !question.isNew && (
                                <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded">
                                  Diubah
                                </span>
                              )}
                            </CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeQuestion(qIndex)}
                            disabled={deletingIds.has(question.id || 0)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Question Text */}
                        <div className="space-y-2">
                          <Label>Pertanyaan</Label>
                          <Textarea
                            value={question.question}
                            onChange={(e) =>
                              updateQuestionField(
                                qIndex,
                                "question",
                                e.target.value
                              )
                            }
                            placeholder="Masukkan pertanyaan"
                            rows={2}
                          />
                        </div>

                        {/* Type and Points */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Tipe</Label>
                            <Select
                              value={question.type}
                              onValueChange={(value) =>
                                updateQuestionField(qIndex, "type", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MultipleChoice">
                                  Multiple Choice
                                </SelectItem>
                                <SelectItem value="TrueFalse">
                                  True/False
                                </SelectItem>
                                <SelectItem value="Essay">Essay</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Poin</Label>
                            <Input
                              type="number"
                              min="1"
                              value={question.points}
                              onChange={(e) =>
                                updateQuestionField(
                                  qIndex,
                                  "points",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>

                        {/* Answers */}
                        {question.type !== "Essay" && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Jawaban</Label>
                              {question.type === "MultipleChoice" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addAnswer(qIndex)}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Tambah
                                </Button>
                              )}
                            </div>
                            <div className="space-y-2">
                              {question.answers.map((answer, aIndex) => (
                                <div
                                  key={aIndex}
                                  className="flex gap-2 items-center"
                                >
                                  {question.type === "MultipleChoice" ? (
                                    <>
                                      <input
                                        type="radio"
                                        id={`q${qIndex}-a${aIndex}`}
                                        name={`question-${qIndex}`}
                                        checked={answer.is_correct}
                                        onChange={() =>
                                          setCorrectAnswer(qIndex, aIndex)
                                        }
                                        className="h-4 w-4 accent-primary cursor-pointer"
                                      />
                                      <label
                                        htmlFor={`q${qIndex}-a${aIndex}`}
                                        className="flex-1 cursor-pointer"
                                      >
                                        <Input
                                          value={answer.answer}
                                          onChange={(e) =>
                                            updateAnswer(
                                              qIndex,
                                              aIndex,
                                              "answer",
                                              e.target.value
                                            )
                                          }
                                          placeholder={`Jawaban ${String.fromCharCode(
                                            65 + aIndex
                                          )}`}
                                        />
                                      </label>
                                      {question.answers.length > 2 && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            removeAnswer(qIndex, aIndex)
                                          }
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <Checkbox
                                        id={`q${qIndex}-a${aIndex}`}
                                        checked={answer.is_correct}
                                        onCheckedChange={() =>
                                          setCorrectAnswer(qIndex, aIndex)
                                        }
                                      />
                                      <label
                                        htmlFor={`q${qIndex}-a${aIndex}`}
                                        className="flex-1 cursor-pointer"
                                      >
                                        <Input
                                          value={answer.answer}
                                          onChange={(e) =>
                                            updateAnswer(
                                              qIndex,
                                              aIndex,
                                              "answer",
                                              e.target.value
                                            )
                                          }
                                          placeholder={answer.answer}
                                          disabled
                                        />
                                      </label>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Add Question Button */}
                <Button
                  variant="outline"
                  onClick={addNewQuestion}
                  className="w-full"
                  disabled={isSaving}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Pertanyaan Baru
                </Button>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                    disabled={isSaving}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={validateAndSave}
                    className="flex-1"
                    disabled={isSaving || !hasChanges}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Menyimpan..." : "Simpan Semua Perubahan"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
