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
import { MaterialEditor } from "@/components/material-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  fetchQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "@/lib/api/quizzes";
import { CreateQuestionInput, UpdateQuestionInput } from "@/types/section";
import { Plus, Trash2, Save, GripVertical, MinusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface ManageQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: number;
  quizId: number;
  quizTitle: string;
}

interface QuestionForm {
  id?: number;
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
  isDeleted?: boolean;
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchQuestions(sectionId, quizId);
      console.log("Pertanyaan dimuat:", data);
      
      if (!data || data.length === 0) {
        console.log("Tidak ada pertanyaan, mulai dengan daftar kosong");
        setQuestions([]);
        return;
      }
      
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
      console.error("Kesalahan saat memuat pertanyaan:", error);
      toast.error("Gagal memuat pertanyaan");
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sectionId, quizId]);

  const addNewQuestion = () => {
    const newQuestion: QuestionForm = {
      question: "",
      type: "MultipleChoice",
      points: "10",
      answers: [
        { answer: "", is_correct: false },
        { answer: "", is_correct: false },
        { answer: "", is_correct: false },
        { answer: "", is_correct: false },
      ],
      isNew: true,
      isModified: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  const openDeleteDialog = (index: number) => {
    setQuestionToDelete(index);
    setDeleteDialogOpen(true);
  };

  const removeQuestion = () => {
    if (questionToDelete === null) return;

    const index = questionToDelete;
    const question = questions[index];

    if (question.id) {
      const newQuestions = [...questions];
      newQuestions[index] = { ...newQuestions[index], isDeleted: true };
      setQuestions(newQuestions);
      toast.success("Pertanyaan ditandai untuk dihapus");
    } else {
      setQuestions(questions.filter((_, i) => i !== index));
      toast.success("Pertanyaan dihapus");
    }

    setDeleteDialogOpen(false);
    setQuestionToDelete(null);
  };

  const updateQuestionField = (
    index: number,
    field: keyof QuestionForm,
    value: string | number
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
    value: string | boolean
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
      question.answers.forEach((ans, i) => {
        ans.is_correct = i === answerIndex;
      });
    } else {
      question.answers[answerIndex].is_correct =
        !question.answers[answerIndex].is_correct;
    }

    question.isModified = !question.isNew;
    setQuestions(newQuestions);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newQuestions = [...questions];
    const draggedQuestion = newQuestions[draggedIndex];
    newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(index, 0, draggedQuestion);

    setQuestions(newQuestions);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const validateAndSave = async () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      if (q.isDeleted) continue;

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
      const questionsToDelete = questions.filter(q => q.isDeleted && q.id);
      for (const q of questionsToDelete) {
        await deleteQuestion(sectionId, q.id!);
      }

      for (const q of questions) {
        if (q.isDeleted) continue;
        
        if (q.isNew) {
          const questionData: Partial<CreateQuestionInput> = {
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

          await createQuestion(sectionId, quizId, questionData as CreateQuestionInput);
        } else if (q.isModified && q.id) {
          const questionData: Partial<UpdateQuestionInput> = {
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

          await updateQuestion(sectionId, q.id, questionData as UpdateQuestionInput);
        }
      }

      toast.success("Semua pertanyaan berhasil disimpan");
      router.refresh();
      onClose();
    } catch (error) {
      console.error("Kesalahan saat menyimpan pertanyaan:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menyimpan pertanyaan"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = questions.some((q) => q.isNew || q.isModified || q.isDeleted);

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
                <div className="space-y-4">
                  {questions
                    .filter((q) => !q.isDeleted)
                    .map((question, qIndex) => {
                      const actualIndex = questions.indexOf(question);
                      return (
                        <Card
                          key={actualIndex}
                          draggable
                          onDragStart={() => handleDragStart(actualIndex)}
                          onDragOver={(e) => handleDragOver(e, actualIndex)}
                          onDragEnd={handleDragEnd}
                          className={`${
                            question.isNew
                              ? "border-primary"
                              : question.isModified
                              ? "border-yellow-500"
                              : ""
                          } ${
                            draggedIndex === actualIndex
                              ? "opacity-50"
                              : "cursor-move"
                          }`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
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
                                onClick={() => openDeleteDialog(actualIndex)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label>Pertanyaan</Label>
                              <MaterialEditor
                                value={question.question}
                                onChange={(value) =>
                                  updateQuestionField(
                                    actualIndex,
                                    "question",
                                    value
                                  )
                                }
                                placeholder="Masukkan pertanyaan"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Tipe</Label>
                                <Input
                                  value="Multiple Choice"
                                  disabled
                                  className="bg-muted"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Poin</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={question.points}
                                  onChange={(e) =>
                                    updateQuestionField(
                                      actualIndex,
                                      "points",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>Pilihan Jawaban</Label>
                                <div className="flex gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      removeAnswer(
                                        actualIndex,
                                        question.answers.length - 1
                                      )
                                    }
                                    disabled={question.answers.length <= 2}
                                    title="Kurangi pilihan"
                                  >
                                    <MinusCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => addAnswer(actualIndex)}
                                    disabled={question.answers.length >= 5}
                                    title="Tambah pilihan"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                {question.answers.map((answer, aIndex) => {
                                  const label = String.fromCharCode(65 + aIndex);
                                  return (
                                    <div
                                      key={aIndex}
                                      className="flex items-center gap-2"
                                    >
                                      <input
                                        type="radio"
                                        id={`correct-${actualIndex}-${aIndex}`}
                                        name={`correct-${actualIndex}`}
                                        checked={answer.is_correct}
                                        onChange={() =>
                                          setCorrectAnswer(actualIndex, aIndex)
                                        }
                                        className="h-4 w-4"
                                      />
                                      <Label
                                        htmlFor={`correct-${actualIndex}-${aIndex}`}
                                        className="font-semibold min-w-[24px]"
                                      >
                                        {label}.
                                      </Label>
                                      <Input
                                        placeholder={`Pilihan ${label}`}
                                        value={answer.answer}
                                        onChange={(e) =>
                                          updateAnswer(
                                            actualIndex,
                                            aIndex,
                                            "answer",
                                            e.target.value
                                          )
                                        }
                                        className="flex-1"
                                      />
                                    </div>
                                  );
                                })}
                                <p className="text-xs text-muted-foreground">
                                  Pilih radio button untuk menandai jawaban yang
                                  benar
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  onClick={addNewQuestion}
                  className="w-full"
                  disabled={isSaving}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Pertanyaan Baru
                </Button>

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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pertanyaan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pertanyaan ini? Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setQuestionToDelete(null)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={removeQuestion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
