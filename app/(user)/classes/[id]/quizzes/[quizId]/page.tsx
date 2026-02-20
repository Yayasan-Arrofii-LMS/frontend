"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Trophy,
  RotateCcw,
  Flag,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  startQuiz,
  saveAnswer,
  submitQuiz,
  getQuizResult,
  getSavedAnswers,
  getMyAttempts,
  getQuizQuestions,
} from "@/lib/api/quizzes";
import {
  QuizAttempt,
  SavedAnswersData,
  Question,
  Answer,
} from "@/types/section";
import { cn } from "@/lib/utils";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const classId = params.id as string;
  const quizId = parseInt(params.quizId as string);

  // We need sectionId - will get it from query param or fetch from quiz details
  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const sectionId = parseInt(searchParams.get("sectionId") || "1");

  const [isLoading, setIsLoading] = useState(true);
  const [quizData, setQuizData] = useState<SavedAnswersData | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [result, setResult] = useState<QuizAttempt | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [reviewQuestions, setReviewQuestions] = useState<Question[]>([]);
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const lastSubmittedRef = useRef<Record<number, number>>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Silakan login terlebih dahulu");
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Load quiz or start new attempt
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadQuiz() {
      try {
        setIsLoading(true);

        // Check if there's an ongoing attempt
        const { attempts } = await getMyAttempts(sectionId, quizId);
        const submittedAttempts = attempts.filter((a) => a.submitted_at);

        // Check if max attempts reached
        const anyAttempt = attempts[0];
        if (anyAttempt?.quiz) {
          // Check open_at and close_at
          const now = new Date();
          const openAt = new Date(anyAttempt.quiz.open_at);
          const closeAt = new Date(anyAttempt.quiz.close_at);

          if (now < openAt) {
            toast.error(`Kuis belum dibuka. Akan dibuka pada ${openAt.toLocaleString("id-ID")}`);
            router.push(`/classes/${classId}`);
            return;
          }

          if (now > closeAt) {
            toast.error(`Kuis telah ditutup pada ${closeAt.toLocaleString("id-ID")}`);
            router.push(`/classes/${classId}`);
            return;
          }

          if (
            anyAttempt.quiz.max_attempts > 0 &&
            submittedAttempts.length >= anyAttempt.quiz.max_attempts
          ) {
            toast.error(
              `Anda telah mencapai batas maksimal ${anyAttempt.quiz.max_attempts} percobaan`
            );
            router.push(`/classes/${classId}`);
            return;
          }
        }
        const ongoingAttempt = attempts.find((a) => !a.submitted_at);

        if (ongoingAttempt) {
          // Resume ongoing attempt
          setAttemptId(ongoingAttempt.id);
          const savedData = await getSavedAnswers(sectionId, ongoingAttempt.id);
          setQuizData(savedData);

          // Load saved answers
          const savedAnswers: Record<number, number[]> = {};
          savedData.questions.forEach((q) => {
            if (q.savedAnswer?.selectedAnswerIds) {
              savedAnswers[q.id] = q.savedAnswer.selectedAnswerIds;
            }
          });
          setAnswers(savedAnswers);

          // Calculate time remaining
          if (savedData.timeLimit) {
            const startTime = new Date(savedData.startedAt).getTime();
            const now = Date.now();
            const elapsed = Math.floor((now - startTime) / 1000); // seconds
            const remaining = savedData.timeLimit * 60 - elapsed; // convert to seconds
            setTimeRemaining(remaining > 0 ? remaining : 0);
          }
        } else {
          // No ongoing attempt - start new quiz automatically
          // User already confirmed in class detail page
          try {
            const newAttempt = await startQuiz(sectionId, quizId);
            setAttemptId(newAttempt.id);

            const savedData = await getSavedAnswers(sectionId, newAttempt.id);
            setQuizData(savedData);

            if (savedData.timeLimit) {
              setTimeRemaining(savedData.timeLimit * 60);
            }

            toast.success("Kuis dimulai! Semangat!");
          } catch (startError) {
            // Handle specific errors from startQuiz
            const error = startError as Error;
            if (
              error.message?.includes("Maksimal percobaan") ||
              error.message?.includes("max attempts")
            ) {
              toast.error("Anda telah mencapai batas maksimal percobaan");
            } else {
              toast.error("Gagal memulai kuis");
            }
            router.push(`/classes/${classId}`);
            return;
          }
        }
      } catch (error) {
        console.error("Failed to load quiz:", error);
        toast.error("Gagal memuat kuis");
        router.push(`/classes/${classId}`);
      } finally {
        setIsLoading(false);
      }
    }

    loadQuiz();
  }, [isAuthenticated, quizId, sectionId, classId, router]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || result) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, [timeRemaining, result]);

  const handleAnswerChange = async (questionId: number, answerId: number) => {
    if (!attemptId) return;

    // Prevent duplicate submission for same question/answer
    if (lastSubmittedRef.current[questionId] === answerId) {
      return;
    }
    lastSubmittedRef.current[questionId] = answerId;

    // Update local state
    setAnswers((prev) => ({
      ...prev,
      [questionId]: [answerId],
    }));

    // Auto-save to backend
    try {
      await saveAnswer(sectionId, {
        attemptId,
        questionId,
        selectedAnswerIds: [answerId],
      });
    } catch (error) {
      console.error("Failed to save answer:", error);
      toast.error("Gagal menyimpan jawaban");
      // Reset ref to allow retry
      delete lastSubmittedRef.current[questionId];
    }
  };

  const handleSubmit = async () => {
    if (!attemptId) return;

    try {
      setIsSubmitting(true);
      await submitQuiz(sectionId, attemptId);

      // Get result
      const quizResult = await getQuizResult(sectionId, attemptId);
      setResult(quizResult);
      toast.success("Kuis berhasil dikumpulkan!");
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast.error("Gagal mengumpulkan kuis");
    } finally {
      setIsSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  const loadReview = async () => {
    try {
      // Use questions from result.quiz.quiz_question which has quiz_answer with is_correct
      if (result && result.quiz && result.quiz.quiz_question) {
        const questions = result.quiz.quiz_question;
        console.log("Review questions from result.quiz:", questions);
        console.log("User answers:", answers);
        setReviewQuestions(questions);
        setShowReview(true);
      } else {
        toast.error("Data pembahasan tidak tersedia");
      }
    } catch (error) {
      console.error("Failed to load review:", error);
      toast.error("Gagal memuat pembahasan");
    }
  };

  const toggleFlag = (questionId: number) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    const questionId = quizData?.questions[index]?.id;
    if (questionId && questionRefs.current[questionId]) {
      questionRefs.current[questionId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show result if quiz is submitted
  if (result) {
    const passed = result.isPassed ?? false;

    // Show review mode
    if (showReview && reviewQuestions.length > 0) {
      return (
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => setShowReview(false)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Hasil
          </Button>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Pembahasan Kuis</CardTitle>
              <CardDescription>
                Review jawaban dan pembahasan untuk setiap soal
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-6">
            {reviewQuestions.map((question, index) => {
              const userAnswer = answers[question.id]?.[0];
              const questionAnswers =
                question.Answer || question.quiz_answer || [];

              const correctAnswer = questionAnswers.find(
                (a: Answer) => a.is_correct
              );
              const isCorrect = userAnswer === correctAnswer?.id;

              return (
                <Card key={question.id}>
                  <CardHeader>
                    <div className="flex gap-3">
                      <Badge variant="outline" className="shrink-0">
                        {index + 1}
                      </Badge>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-medium prose prose-slate dark:prose-invert max-w-none">
                          <div dangerouslySetInnerHTML={{ __html: question.question }} />
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {question.points} poin
                        </CardDescription>
                      </div>
                      {isCorrect ? (
                        <Badge variant="default" className="shrink-0">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Benar
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="shrink-0">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Salah
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Answer Options */}
                    <div className="space-y-2">
                      {questionAnswers.map((answer: Answer) => {
                        const isUserAnswer = answer.id === userAnswer;
                        const isCorrectAnswer = answer.is_correct;

                        return (
                          <div
                            key={answer.id}
                            className={cn(
                              "flex items-start gap-3 p-4 rounded-lg border-2",
                              isCorrectAnswer &&
                                "bg-green-50 border-green-500 dark:bg-green-950/30",
                              isUserAnswer &&
                                !isCorrectAnswer &&
                                "bg-red-50 border-red-500 dark:bg-red-950/30",
                              !isUserAnswer &&
                                !isCorrectAnswer &&
                                "border-border"
                            )}
                          >
                            <div className="flex-1">
                              <p className="font-medium">{answer.answer}</p>
                            </div>
                            <div className="flex flex-col gap-1 shrink-0">
                              {isCorrectAnswer && (
                                <Badge variant="default" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Jawaban Benar
                                </Badge>
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Jawaban Anda
                                </Badge>
                              )}
                              {isUserAnswer && isCorrectAnswer && (
                                <Badge variant="secondary" className="text-xs">
                                  Jawaban Anda
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 flex gap-3">
            <Button
              onClick={() => setShowReview(false)}
              variant="outline"
              className="flex-1"
            >
              Kembali ke Hasil
            </Button>
            <Button
              onClick={() => router.push(`/classes/${classId}`)}
              className="flex-1"
            >
              Kembali ke Kelas
            </Button>
          </div>
        </div>
      );
    }

    // Show result summary
    return (
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push(`/classes/${classId}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Kelas
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {passed ? (
                <Trophy className="h-16 w-16 text-yellow-500" />
              ) : (
                <RotateCcw className="h-16 w-16 text-blue-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {passed ? "Selamat! Anda Lulus" : "Belum Lulus"}
            </CardTitle>
            <CardDescription>Hasil kuis {quizData?.quizTitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Summary */}
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="font-semibold">Nilai Anda:</span>
                <div className="text-right">
                  <div className="text-3xl font-bold">{result.score}</div>
                  {result.totalScore && (
                    <div className="text-sm text-muted-foreground">
                      dari {result.totalScore} poin
                    </div>
                  )}
                </div>
              </div>

              {result.quiz &&
                result.quiz.passing_grade &&
                result.totalScore && (
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <span className="font-semibold">Nilai Kelulusan:</span>
                    <span className="text-xl font-bold">
                      {(
                        (result.quiz.passing_grade / 100) *
                        result.totalScore
                      ).toFixed(2)}
                    </span>
                  </div>
                )}

              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="font-semibold">Status:</span>
                <Badge variant={passed ? "default" : "secondary"}>
                  {passed ? "LULUS" : "BELUM LULUS"}
                </Badge>
              </div>

              {/* Quiz Statistics */}
              {result.quiz && result.quiz.quiz_question && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <div className="text-2xl font-bold">
                      {result.quiz.quiz_question.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total Soal
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <div className="text-2xl font-bold">
                      {result.attemp_answer?.filter((answer: { attemp_multiple_answer?: { quiz_answer?: { is_correct: boolean } }[] }) =>
                        answer.attemp_multiple_answer?.some(
                          (ma: { quiz_answer?: { is_correct: boolean } }) => ma.quiz_answer?.is_correct
                        )
                      ).length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Jawaban Benar
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={loadReview} variant="outline" size="lg">
                <BookOpen className="h-4 w-4 mr-2" />
                Lihat Pembahasan
              </Button>

              <div className="flex gap-3">
                <Button
                  onClick={() => router.push(`/classes/${classId}`)}
                  className="flex-1"
                >
                  Kembali ke Kelas
                </Button>
                {!passed && result.quiz && (
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="flex-1"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Coba Lagi
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quizData) return null;

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quizData.questions.length;
  const progress = (answeredCount / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={() => setShowExitDialog(true)}
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Keluar
            </Button>

            <div className="flex items-center gap-4">
              {/* Progress Indicator */}
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Progress:</span>
                  <Badge variant="secondary">
                    {answeredCount}/{totalQuestions}
                  </Badge>
                </div>
                <Progress value={progress} className="h-2 w-32" />
              </div>

              {/* Timer */}
              {timeRemaining !== null && (
                <Badge
                  variant={timeRemaining < 300 ? "destructive" : "secondary"}
                  className="text-base font-mono"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {formatTime(timeRemaining)}
                </Badge>
              )}
            </div>
          </div>

          {/* Mobile Progress */}
          <div className="md:hidden mt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-muted-foreground">
                {answeredCount} / {totalQuestions} terjawab
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar Layout */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Questions Area */}
          <div className="flex-1 space-y-6 pb-24">
            {/* Quiz Title - Only shown once at top */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{quizData.quizTitle}</CardTitle>
                <CardDescription>
                  {totalQuestions} pertanyaan • Kerjakan dengan teliti
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Question Cards */}
            {quizData.questions.map((question, index) => (
              <Card
                key={question.id}
                ref={(el) => {
                  questionRefs.current[question.id] = el;
                }}
              >
                <CardHeader>
                  <div className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">
                      {index + 1}
                    </Badge>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-medium prose prose-slate dark:prose-invert max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: question.question }} />
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {question.points} poin
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant={
                          flaggedQuestions.has(question.id)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => toggleFlag(question.id)}
                      >
                        <Flag
                          className={cn(
                            "h-4 w-4",
                            flaggedQuestions.has(question.id) && "fill-current"
                          )}
                        />
                      </Button>
                      {answers[question.id] && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={answers[question.id]?.[0]?.toString()}
                    onValueChange={(value: string) =>
                      handleAnswerChange(question.id, parseInt(value))
                    }
                  >
                    <div className="space-y-3">
                      {question.answers.map((answer) => (
                        <div
                          key={answer.id}
                          onClick={(e) => {
                            // Prevent double triggering when clicking label (which triggers radio change)
                            if ((e.target as HTMLElement).closest("label")) {
                              return;
                            }
                            handleAnswerChange(question.id, answer.id);
                          }}
                          className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors"
                        >
                          <RadioGroupItem
                            value={answer.id.toString()}
                            id={`q${question.id}-a${answer.id}`}
                            className="pointer-events-none"
                          />
                          <Label
                            htmlFor={`q${question.id}-a${answer.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            {answer.answer}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Fixed Sidebar Navigator - Desktop */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-24 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Navigator Soal</CardTitle>
                  <CardDescription>
                    Klik nomor untuk berpindah soal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {quizData.questions.map((question, index) => {
                      const isAnswered = !!answers[question.id];
                      const isFlagged = flaggedQuestions.has(question.id);
                      const isCurrent = index === currentQuestionIndex;

                      return (
                        <button
                          key={question.id}
                          onClick={() => goToQuestion(index)}
                          className={cn(
                            "relative aspect-square rounded-md border-2 text-sm font-medium transition-all hover:scale-105",
                            isCurrent && "ring-2 ring-primary ring-offset-2",
                            isAnswered
                              ? "bg-green-100 border-green-500 text-green-700 dark:bg-green-950 dark:text-green-300"
                              : "bg-background hover:bg-accent",
                            isFlagged && "border-yellow-500"
                          )}
                        >
                          {index + 1}
                          {isFlagged && (
                            <Flag className="absolute -top-1 -right-1 h-3 w-3 fill-yellow-500 text-yellow-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 bg-green-100 border-green-500" />
                      <span>Terjawab</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 bg-background" />
                      <span>Belum dijawab</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-yellow-500 relative">
                        <Flag className="absolute -top-1 -right-1 h-2 w-2 fill-yellow-500 text-yellow-500" />
                      </div>
                      <span>Ditandai</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button in Sidebar */}
              <Button
                onClick={() => setShowSubmitDialog(true)}
                disabled={answeredCount === 0}
                className="w-full"
                size="lg"
              >
                Kumpulkan Kuis
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer - Mobile Only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                goToQuestion(Math.max(0, currentQuestionIndex - 1))
              }
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {currentQuestionIndex + 1}/{totalQuestions}
              </span>
              {answeredCount < totalQuestions ? (
                <Badge variant="secondary" className="text-xs">
                  {totalQuestions - answeredCount} belum
                </Badge>
              ) : (
                <Badge variant="default" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Selesai
                </Badge>
              )}
            </div>

            {currentQuestionIndex === totalQuestions - 1 ? (
              <Button
                size="sm"
                onClick={() => setShowSubmitDialog(true)}
                disabled={answeredCount === 0}
              >
                Kumpulkan
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  goToQuestion(
                    Math.min(totalQuestions - 1, currentQuestionIndex + 1)
                  )
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Keluar dari Kuis?</AlertDialogTitle>
            <AlertDialogDescription>
              Progress Anda akan tersimpan dan Anda dapat melanjutkan kuis ini
              nanti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push(`/classes/${classId}`)}
            >
              Ya, Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kumpulkan Kuis?</AlertDialogTitle>
            <AlertDialogDescription>
              {answeredCount < totalQuestions ? (
                <>
                  Anda masih memiliki{" "}
                  <strong>{totalQuestions - answeredCount}</strong> pertanyaan
                  yang belum dijawab. Yakin ingin mengumpulkan sekarang?
                </>
              ) : (
                "Anda yakin ingin mengumpulkan kuis ini? Jawaban tidak dapat diubah setelah dikumpulkan."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Mengumpulkan..." : "Ya, Kumpulkan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
