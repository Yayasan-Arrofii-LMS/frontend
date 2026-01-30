"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bulkCreateQuiz } from "@/lib/api/quizzes";
import { toast } from "sonner";
import { ArrowLeft, Minimize2, Plus, Trash2, MinusCircle } from "lucide-react";
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

const CHOICE_LABELS = ["A", "B", "C", "D", "E"];

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
  const [questions, setQuestions] = useState<QuestionData[]>([
    {
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
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load draft from sessionStorage when page loads
  useEffect(() => {
    const draftKey = `quiz-draft-${sectionId}`;
    const savedDraft = sessionStorage.getItem(draftKey);
    
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setTitle(parsed.title || "");
        setDescription(parsed.description || "");
        setMaxAttempts(parsed.maxAttempts?.toString() || "3");
        setTimeLimit(parsed.timeLimit?.toString() || "60");
        setOpenAt(parsed.openAt || "");
        setCloseAt(parsed.closeAt || "");
        setPassingGrade(parsed.passingGrade?.toString() || "70");
        setXp(parsed.xp?.toString() || "10");
        if (parsed.questions && parsed.questions.length > 0) {
          setQuestions(parsed.questions);
        }
        // Clear the draft after loading
        sessionStorage.removeItem(draftKey);
      } catch (error) {
        console.error("Failed to parse quiz draft:", error);
      }
    }
  }, [sectionId]);

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
      // Convert questions to API format
      const questionsData = questions.map((q) => {
        const correctAnswerIndex = parseInt(q.correctAnswer);
        const answers = q.choices.map((choice, index) => ({
          answer: choice.text.trim(),
          is_correct: index === correctAnswerIndex,
        }));

        return {
          question: q.question.trim(),
          type: "MultipleChoice" as const,
          points: q.points,
          answers: answers,
        };
      });

      // Bulk create quiz dengan pertanyaan sekaligus
      await bulkCreateQuiz(sectionId, {
        title: title.trim(),
        description: description.trim(),
        max_attempts: maxAttemptsNum,
        time_limit: timeLimitNum,
        open_at: new Date(openAt).toISOString(),
        close_at: new Date(closeAt).toISOString(),
        passing_grade: passingGradeNum,
        xp: xpNum,
        questions: questionsData,
      });

      toast.success("Quiz dan pertanyaan berhasil ditambahkan");
      setPreference("modal");
      router.push(`/teacher/my-courses/${classId}`);
      router.refresh();
    } catch (error) {
      toast.error("Gagal menambahkan quiz");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMinimize = () => {
    // Save draft before minimizing
    const formData = {
      title,
      description,
      maxAttempts,
      timeLimit,
      openAt,
      closeAt,
      passingGrade,
      xp,
      questions,
    };
    sessionStorage.setItem(`quiz-draft-${sectionId}`, JSON.stringify(formData));
    
    setPreference("modal");
    router.push(`/teacher/my-courses/${classId}?openAddQuiz=${sectionId}`);
  };

  const handleBack = () => {
    setPreference("modal");
    router.push(`/teacher/my-courses/${classId}`);
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

          {/* Questions Section */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Pertanyaan</Label>
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
                        rows={3}
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
                      className="w-32"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
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
