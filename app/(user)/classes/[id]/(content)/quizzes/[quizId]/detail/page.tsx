"use client";

import { useEffect, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Trophy,
  Target,
  AlertCircle,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Calendar,
} from "lucide-react";
import { fetchQuizDetail, QuizDetail } from "@/lib/api/quiz-detail";
import { toast } from "sonner";

export default function QuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  const quizId = parseInt(params.quizId as string);

  const [quizData, setQuizData] = useState<QuizDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadQuizDetail() {
      try {
        setIsLoading(true);

        // Extract sectionId from URL or get from state
        // For now, we'll need to pass it through the URL
        const urlParams = new URLSearchParams(window.location.search);
        const sectionId = urlParams.get("sectionId");

        if (!sectionId) {
          toast.error("Section ID tidak ditemukan");
          router.push(`/classes/${classId}`);
          return;
        }

        const data = await fetchQuizDetail(parseInt(sectionId), quizId);
        setQuizData(data);
      } catch (error) {
        console.error("Failed to load quiz detail:", error);
        toast.error("Gagal memuat detail kuis");
      } finally {
        setIsLoading(false);
      }
    }

    loadQuizDetail();
  }, [classId, quizId, router]);

  const handleStartQuiz = () => {
    if (!quizData) return;

    // Redirect to quiz page with sectionId
    router.push(
      `/classes/${classId}/quizzes/${quizId}?sectionId=${quizData.sectionId}`
    );
  };

  const handleContinueQuiz = () => {
    if (!quizData?.ongoingAttempt) return;

    router.push(
      `/classes/${classId}/quizzes/${quizId}?sectionId=${quizData.sectionId}&attemptId=${quizData.ongoingAttempt.id}`
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              Kuis tidak ditemukan
            </p>
            <Button
              onClick={() => router.push(`/classes/${classId}`)}
              className="mt-4"
            >
              Kembali ke Kelas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canStartQuiz = quizData.attemptsRemaining > 0 || quizData.max_attempts === 0;
  const hasOngoingAttempt = quizData.ongoingAttempt !== null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Quiz Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{quizData.title}</CardTitle>
              <CardDescription className="text-base">
                {quizData.description}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {quizData.xp} XP
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quiz Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Total Questions */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Soal</p>
                <p className="text-lg font-semibold">
                  {quizData.totalQuestions} Soal
                </p>
              </div>
            </div>

            {/* Time Limit */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Waktu Pengerjaan</p>
                <p className="text-lg font-semibold">
                  {quizData.time_limit} Menit
                </p>
              </div>
            </div>

            {/* Passing Grade */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nilai Lulus</p>
                <p className="text-lg font-semibold">
                  {quizData.passing_grade}%
                </p>
              </div>
            </div>

            {/* Attempts */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Percobaan</p>
                <p className="text-lg font-semibold">
                  {quizData.max_attempts === 0
                    ? "Tidak Terbatas"
                    : `${quizData.attemptsUsed} / ${quizData.max_attempts}`}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Best Score */}
          {quizData.bestScore !== null && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nilai Terbaik</p>
                    <p className="text-2xl font-bold text-primary">
                      {quizData.bestScore}
                    </p>
                  </div>
                </div>
                {quizData.bestScore >= quizData.passing_grade ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Lulus
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-4 w-4 mr-1" />
                    Belum Lulus
                  </Badge>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-4">
            {hasOngoingAttempt ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-amber-700 dark:text-amber-400">
                      Anda memiliki kuis yang belum selesai
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Lanjutkan pengerjaan kuis atau mulai percobaan baru
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleContinueQuiz}
                    className="flex-1"
                    size="lg"
                  >
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Lanjutkan Kuis
                  </Button>
                  {canStartQuiz && (
                    <Button
                      onClick={handleStartQuiz}
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      Mulai Baru
                    </Button>
                  )}
                </div>
              </div>
            ) : canStartQuiz ? (
              <Button onClick={handleStartQuiz} className="w-full" size="lg">
                <PlayCircle className="h-5 w-5 mr-2" />
                Mulai Kuis
              </Button>
            ) : (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
                <XCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
                <p className="font-semibold text-destructive">
                  Batas percobaan telah tercapai
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Anda telah menggunakan semua percobaan yang tersedia
                </p>
              </div>
            )}
          </div>

          {/* Important Notes */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>Pastikan koneksi internet Anda stabil sebelum memulai</p>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>Waktu mulai dihitung setelah Anda klik tombol mulai kuis</p>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>Jawaban akan otomatis tersimpan saat Anda menjawab</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attempts History */}
      {quizData.attempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Percobaan</CardTitle>
            <CardDescription>
              Daftar semua percobaan kuis yang telah Anda lakukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quizData.attempts.map((attempt, index) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Percobaan</p>
                      <p className="text-lg font-bold">
                        #{quizData.attempts.length - index}
                      </p>
                    </div>
                    <Separator orientation="vertical" className="h-12" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-2xl font-bold">{attempt.score}</p>
                        {attempt.is_graded ? (
                          attempt.score >= quizData.passing_grade ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Lulus
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Tidak Lulus
                            </Badge>
                          )
                        ) : (
                          <Badge variant="secondary">Dinilai</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(attempt.started_at).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
