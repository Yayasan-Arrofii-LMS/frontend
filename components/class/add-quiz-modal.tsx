"use client";

import { useState } from "react";
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";

interface AddQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (quiz?: any) => void; // dummy callback
  classId: string;
  sectionId: number;
}

type Question = {
  id: string;
  text: string;
  options: string[];
  correct?: number | null;
};

function makeEmptyQuestion(idSuffix = ""): Question {
  return {
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${idSuffix}`,
    text: "",
    options: ["", "", "", ""],
    correct: null,
  };
}

export function AddQuizModal({ isOpen, onClose, onAdd }: AddQuizModalProps) {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([makeEmptyQuestion()]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addQuestion = () => {
    setQuestions((s) => [...s, makeEmptyQuestion()]);
  };

  const removeQuestion = (index: number) => {
    // Prevent removing if only 1 question
    if (questions.length <= 1) {
      toast.error("Minimal harus ada 1 pertanyaan");
      return;
    }
    setQuestions((s) => s.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, patch: Partial<Question>) => {
    setQuestions((s) => s.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  const addOption = (index: number) => {
    const q = questions[index];
    if (q.options.length >= 6) {
      toast.error("Maksimal 6 opsi jawaban");
      return;
    }
    updateQuestion(index, { options: [...q.options, ""] });
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const q = questions[qIndex];
    if (q.options.length <= 4) {
      toast.error("Minimal 4 opsi jawaban");
      return;
    }
    const newOptions = q.options.filter((_, i) => i !== optIndex);
    const newCorrect = q.correct === optIndex 
      ? null 
      : (q.correct !== null && q.correct !== undefined && q.correct > optIndex 
          ? q.correct - 1 
          : q.correct);
    updateQuestion(qIndex, { options: newOptions, correct: newCorrect });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((q) => q.id === active.id);
        const newIndex = items.findIndex((q) => q.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!title.trim()) {
      toast.error("Judul quiz wajib diisi");
      return;
    }
    if (questions.length === 0) {
      toast.error("Tambahkan minimal 1 pertanyaan");
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        toast.error(`Pertanyaan ke-${i + 1} kosong`);
        return;
      }
      const filledOptions = q.options.filter((o) => o.trim() !== "");
      if (filledOptions.length < 2) {
        toast.error(`Pertanyaan ke-${i + 1} harus punya minimal 2 opsi yang terisi`);
        return;
      }
      if (q.correct === null || q.correct === undefined) {
        toast.error(`Tandai jawaban benar untuk pertanyaan ke-${i + 1}`);
        return;
      }
      if (!q.options[q.correct]?.trim()) {
        toast.error(`Jawaban benar untuk pertanyaan ke-${i + 1} tidak boleh kosong`);
        return;
      }
    }

    setIsSubmitting(true);
    // Dummy save (no API). Pass the quiz object to onAdd for now.
    const quizPayload = {
      title: title.trim(),
      questions,
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Quiz berhasil ditambahkan (dummy)");
      onAdd?.(quizPayload);
      handleClose();
    }, 500);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle("");
      setQuestions([makeEmptyQuestion()]);
      onClose();
    }
  };

  if (!isOpen) return null;

  const questionIds = questions.map((q) => q.id);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Quiz Baru</DialogTitle>
            <DialogDescription>
              Buat quiz pilihan ganda untuk section ini. Kamu bisa menambah
              pertanyaan, memilih jawaban benar, dan mengurutkan soal dengan drag & drop.
            </DialogDescription>
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

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={questionIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <QuestionItem
                      key={q.id}
                      question={q}
                      index={idx}
                      questionsLength={questions.length}
                      onUpdate={(patch) => updateQuestion(idx, patch)}
                      onRemove={() => removeQuestion(idx)}
                      onAddOption={() => addOption(idx)}
                      onRemoveOption={(optIndex) => removeOption(idx, optIndex)}
                      disabled={isSubmitting}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="flex gap-2">
              <Button type="button" onClick={addQuestion} disabled={isSubmitting}>
                Tambah Pertanyaan
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setQuestions([makeEmptyQuestion()])}
                disabled={isSubmitting}
              >
                Reset
              </Button>
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

interface QuestionItemProps {
  question: Question;
  index: number;
  questionsLength: number;
  onUpdate: (patch: Partial<Question>) => void;
  onRemove: () => void;
  onAddOption: () => void;
  onRemoveOption: (optIndex: number) => void;
  disabled: boolean;
}

function QuestionItem({
  question,
  index,
  questionsLength,
  onUpdate,
  onRemove,
  onAddOption,
  onRemoveOption,
  disabled,
}: QuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-md p-4 bg-card ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing mt-1 flex-shrink-0"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label className="mb-0 font-semibold">Pertanyaan {index + 1}</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              disabled={disabled || questionsLength <= 1}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Hapus
            </Button>
          </div>

          <Textarea
            placeholder="Tulis pertanyaan..."
            value={question.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            disabled={disabled}
            rows={3}
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm">Opsi Jawaban (4-6 opsi)</Label>
              {question.options.length < 6 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onAddOption}
                  disabled={disabled}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Tambah Opsi
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {question.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct_${question.id}`}
                    checked={question.correct === oi}
                    onChange={() => onUpdate({ correct: oi })}
                    disabled={disabled}
                    className="flex-shrink-0"
                  />
                  <Input
                    placeholder={`Opsi ${String.fromCharCode(65 + oi)}`}
                    value={opt}
                    onChange={(e) =>
                      onUpdate({
                        options: question.options.map((x, i) =>
                          i === oi ? e.target.value : x
                        ),
                      })
                    }
                    disabled={disabled}
                    className="flex-1"
                  />
                  {question.options.length > 4 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveOption(oi)}
                      disabled={disabled}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Klik radio button untuk menandai jawaban yang benar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddQuizModal;
