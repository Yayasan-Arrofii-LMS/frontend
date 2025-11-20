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
import { toast } from "sonner";
import { fetchQuestions, deleteQuestion } from "@/lib/api/quizzes";
import { Question } from "@/types/section";
import { Plus, Pencil, Trash2, FileQuestion } from "lucide-react";
import { AddQuestionModal } from "./add-question-modal";
import { EditQuestionModal } from "./edit-question-modal";
import {
  Dialog as DeleteDialog,
  DialogContent as DeleteDialogContent,
  DialogDescription as DeleteDialogDescription,
  DialogFooter as DeleteDialogFooter,
  DialogHeader as DeleteDialogHeader,
  DialogTitle as DeleteDialogTitle,
} from "@/components/ui/dialog";

interface ManageQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: number;
  quizId: number;
  quizTitle: string;
}

export function ManageQuestionsModal({
  isOpen,
  onClose,
  sectionId,
  quizId,
  quizTitle,
}: ManageQuestionsModalProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(
    null
  );
  const [isDeletingQuestion, setIsDeletingQuestion] = useState(false);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchQuestions(sectionId, quizId);
      setQuestions(data);
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

  const handleDeleteQuestion = async (questionId: number) => {
    setIsDeletingQuestion(true);
    try {
      await deleteQuestion(sectionId, quizId, questionId);
      toast.success("Pertanyaan berhasil dihapus");
      loadQuestions();
      setDeletingQuestionId(null);
    } catch {
      toast.error("Gagal menghapus pertanyaan");
    } finally {
      setIsDeletingQuestion(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "MultipleChoice":
        return "Multiple Choice";
      case "TrueFalse":
        return "True/False";
      case "Essay":
        return "Essay";
      default:
        return type;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kelola Pertanyaan - {quizTitle}</DialogTitle>
            <DialogDescription>
              Tambah, edit, atau hapus pertanyaan untuk quiz ini
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Add Question Button */}
            <Button
              onClick={() => setIsAddQuestionOpen(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pertanyaan
            </Button>

            {/* Questions List */}
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Memuat pertanyaan...
              </div>
            ) : questions.length === 0 ? (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Belum ada pertanyaan. Tambahkan pertanyaan pertama Anda.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="border rounded-lg p-4 bg-card"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm text-muted-foreground">
                            #{index + 1}
                          </span>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {getTypeLabel(question.type)}
                          </span>
                          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                            {question.points} poin
                          </span>
                        </div>
                        <p className="font-medium mb-2">{question.question}</p>

                        {/* Display answers for Multiple Choice and True/False */}
                        {(question.type === "MultipleChoice" ||
                          question.type === "TrueFalse") &&
                          question.Answer &&
                          question.Answer.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {question.Answer.map((answer, ansIndex) => (
                                <div
                                  key={answer.id}
                                  className={`text-sm px-2 py-1 rounded ${
                                    answer.is_correct
                                      ? "bg-green-100 dark:bg-green-900/20 text-green-900 dark:text-green-100"
                                      : "bg-muted"
                                  }`}
                                >
                                  {String.fromCharCode(65 + ansIndex)}.{" "}
                                  {answer.answer}
                                  {answer.is_correct && (
                                    <span className="ml-2 font-semibold">
                                      ✓
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingQuestion(question)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingQuestionId(question.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Question Modal */}
      <AddQuestionModal
        isOpen={isAddQuestionOpen}
        onClose={() => setIsAddQuestionOpen(false)}
        onAdd={loadQuestions}
        sectionId={sectionId}
        quizId={quizId}
      />

      {/* Edit Question Modal */}
      <EditQuestionModal
        isOpen={editingQuestion !== null}
        onClose={() => setEditingQuestion(null)}
        onUpdate={loadQuestions}
        sectionId={sectionId}
        question={editingQuestion}
      />

      {/* Delete Question Dialog */}
      <DeleteDialog
        open={deletingQuestionId !== null}
        onOpenChange={(open) => !open && setDeletingQuestionId(null)}
      >
        <DeleteDialogContent>
          <DeleteDialogHeader>
            <DeleteDialogTitle>Hapus Pertanyaan?</DeleteDialogTitle>
            <DeleteDialogDescription>
              Apakah Anda yakin ingin menghapus pertanyaan ini? Semua jawaban
              terkait akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </DeleteDialogDescription>
          </DeleteDialogHeader>
          <DeleteDialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingQuestionId(null)}
              disabled={isDeletingQuestion}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deletingQuestionId && handleDeleteQuestion(deletingQuestionId)
              }
              disabled={isDeletingQuestion}
            >
              {isDeletingQuestion ? "Menghapus..." : "Hapus"}
            </Button>
          </DeleteDialogFooter>
        </DeleteDialogContent>
      </DeleteDialog>
    </>
  );
}
