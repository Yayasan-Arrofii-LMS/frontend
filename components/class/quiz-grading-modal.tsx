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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  fetchQuizSubmissions,
  fetchAttemptForGrading,
  gradeAttemptEssays,
} from "@/lib/api/quizzes";
import {
  QuizSubmissionItem,
  QuizAttemptGradingDetail,
  GradeEssayItemInput,
} from "@/types/section";
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Save,
  Search,
  User,
  HelpCircle,
  Award,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: number;
  quizId: number;
  quizTitle: string;
}

export function QuizGradingModal({
  isOpen,
  onClose,
  sectionId,
  quizId,
  quizTitle,
}: QuizGradingModalProps) {
  const [submissions, setSubmissions] = useState<QuizSubmissionItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null);

  // Selected attempt grading state
  const [attemptDetail, setAttemptDetail] = useState<QuizAttemptGradingDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [essayGrades, setEssayGrades] = useState<Record<number, { score: string; feedback: string }>>({});
  const [isSavingGrades, setIsSavingGrades] = useState(false);

  // Filter state for submissions list
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const loadSubmissions = async () => {
    setIsLoadingList(true);
    try {
      const data = await fetchQuizSubmissions(sectionId, quizId);
      setSubmissions(data);
    } catch (error) {
      console.error("Failed to load submissions:", error);
      toast.error("Gagal memuat daftar pengumpulan kuis");
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedAttemptId(null);
      setAttemptDetail(null);
      loadSubmissions();
    }
  }, [isOpen, sectionId, quizId]);

  const handleOpenAttempt = async (attemptId: number) => {
    setSelectedAttemptId(attemptId);
    setIsLoadingDetail(true);
    try {
      const detail = await fetchAttemptForGrading(sectionId, attemptId);
      setAttemptDetail(detail);

      // Pre-fill existing grades & feedback for essay questions
      const initialGrades: Record<number, { score: string; feedback: string }> = {};
      detail.questions.forEach((q: any) => {
        const qId = q.questionId ?? q.id;
        if (q.type === "Essay") {
          initialGrades[qId] = {
            score: q.score !== null && q.score !== undefined ? q.score.toString() : "",
            feedback: q.feedback || "",
          };
        }
      });
      setEssayGrades(initialGrades);
    } catch (error) {
      console.error("Failed to load attempt detail:", error);
      toast.error("Gagal memuat detail pengerjaan siswa");
      setSelectedAttemptId(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleScoreChange = (questionId: number, value: string) => {
    setEssayGrades((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        score: value,
      },
    }));
  };

  const handleFeedbackChange = (questionId: number, value: string) => {
    setEssayGrades((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        feedback: value,
      },
    }));
  };

  const handleSaveGrading = async () => {
    if (!selectedAttemptId || !attemptDetail) return;

    // Validate grades
    const gradesToSubmit: GradeEssayItemInput[] = [];
    const essayQuestions = attemptDetail.questions.filter((q) => q.type === "Essay");

    for (const q of essayQuestions as any[]) {
      const qId = q.questionId ?? q.id;
      const maxPts = q.maxPoints ?? q.points ?? 1;
      const gradeEntry = essayGrades[qId];
      if (!gradeEntry || gradeEntry.score.trim() === "") {
        toast.error(`Pertanyaan #${qId}: Nilai belum diisi`);
        return;
      }

      const scoreNum = parseFloat(gradeEntry.score);
      if (isNaN(scoreNum) || scoreNum < 0) {
        toast.error(`Pertanyaan #${qId}: Nilai tidak boleh negatif`);
        return;
      }

      if (scoreNum > maxPts) {
        toast.error(
          `Pertanyaan #${qId}: Nilai (${scoreNum}) melebihi skor maksimal (${maxPts})`
        );
        return;
      }

      gradesToSubmit.push({
        questionId: qId,
        score: scoreNum,
        feedback: gradeEntry.feedback.trim() || undefined,
      });
    }

    setIsSavingGrades(true);
    try {
      const updated = await gradeAttemptEssays(sectionId, selectedAttemptId, gradesToSubmit);
      setAttemptDetail(updated);
      toast.success("Penilaian kuis berhasil disimpan!");

      // Refresh submissions list in background
      loadSubmissions();
    } catch (error) {
      console.error("Failed to save grading:", error);
      toast.error("Gagal menyimpan penilaian kuis");
    } finally {
      setIsSavingGrades(false);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const studentName =
      sub.user?.name || (sub as any).studentName || (sub as any).student?.name || "";
    const studentEmail =
      sub.user?.email || (sub as any).studentEmail || (sub as any).student?.email || "";

    const matchesSearch =
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentEmail.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === "PENDING") {
      return !sub.isGraded || sub.ungradedEssayCount > 0;
    }
    if (filterStatus === "COMPLETED") {
      return sub.isGraded && sub.ungradedEssayCount === 0;
    }
    return true;
  });

  const pendingCount = submissions.filter(
    (s) => !s.isGraded || s.ungradedEssayCount > 0
  ).length;
  const completedCount = submissions.filter(
    (s) => s.isGraded && s.ungradedEssayCount === 0
  ).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
        {/* Modal Header */}
        <DialogHeader className="p-6 pb-4 border-b shrink-0 bg-background">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <DialogTitle className="text-xl font-bold">
                  Penilaian Kuis Siswa
                </DialogTitle>
              </div>
              <DialogDescription className="text-sm">
                {quizTitle}
              </DialogDescription>
            </div>
            {selectedAttemptId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedAttemptId(null);
                  setAttemptDetail(null);
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Kembali ke Daftar
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedAttemptId ? (
            /* ================= VIEW 1: SUBMISSIONS LIST ================= */
            <div className="space-y-6">
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-muted/40">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Total Pengumpulan
                      </p>
                      <p className="text-2xl font-bold mt-1">{submissions.length}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                  </CardContent>
                </Card>

                <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-medium uppercase tracking-wider">
                        Menunggu Penilaian
                      </p>
                      <p className="text-2xl font-bold text-amber-900 dark:text-amber-200 mt-1">
                        {pendingCount}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-amber-500/50" />
                  </CardContent>
                </Card>

                <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-green-700 dark:text-green-400 font-medium uppercase tracking-wider">
                        Penilaian Selesai
                      </p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-200 mt-1">
                        {completedCount}
                      </p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-500/50" />
                  </CardContent>
                </Card>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama atau email siswa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <Button
                    variant={filterStatus === "ALL" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("ALL")}
                  >
                    Semua ({submissions.length})
                  </Button>
                  <Button
                    variant={filterStatus === "PENDING" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("PENDING")}
                    className={filterStatus === "PENDING" ? "bg-amber-600 hover:bg-amber-700" : ""}
                  >
                    Menunggu ({pendingCount})
                  </Button>
                  <Button
                    variant={filterStatus === "COMPLETED" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("COMPLETED")}
                    className={filterStatus === "COMPLETED" ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    Selesai ({completedCount})
                  </Button>
                </div>
              </div>

              {/* Submissions List */}
              {isLoadingList ? (
                <div className="text-center py-12 text-muted-foreground">
                  Memuat daftar pengumpulan...
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                  <User className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="font-medium text-foreground">Tidak ada data siswa ditemukan</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {submissions.length === 0
                      ? "Belum ada siswa yang mengumpulkan kuis ini."
                      : "Tidak ada data yang sesuai dengan pencarian atau filter."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSubmissions.map((sub) => {
                    const hasUngraded = sub.ungradedEssayCount > 0 || !sub.isGraded;
                    const studentName =
                      sub.user?.name || (sub as any).studentName || (sub as any).student?.name || "Siswa";
                    const studentEmail =
                      sub.user?.email || (sub as any).studentEmail || (sub as any).student?.email || "-";
                    const initial = studentName.charAt(0).toUpperCase();

                    return (
                      <div
                        key={sub.attemptId}
                        className={cn(
                          "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border transition-colors",
                          hasUngraded
                            ? "bg-amber-50/20 border-amber-200/80 dark:border-amber-900/40 hover:bg-amber-50/40"
                            : "bg-card hover:bg-accent/40"
                        )}
                      >
                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                            {initial}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-foreground text-sm truncate">
                                {studentName}
                              </h4>
                              {hasUngraded ? (
                                <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/40 text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Menunggu Penilaian ({sub.ungradedEssayCount} Uraian)
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 dark:bg-green-950/40 text-xs">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Penilaian Selesai
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {studentEmail} • Dikumpulkan: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString("id-ID") : "-"}
                            </p>
                          </div>
                        </div>

                        {/* Scores & Action */}
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                          <div className="text-left sm:text-right">
                            <div className="flex items-baseline gap-1">
                              <span className="text-xs text-muted-foreground">Nilai Akhir:</span>
                              <span className="font-bold text-base">
                                {sub.isGraded
                                  ? sub.finalScore ?? sub.score ?? "-"
                                  : (sub.mcqScore !== null ? `${sub.mcqScore} (MCQ)` : "-")}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {sub.essayCount > 0 ? `${sub.essayCount} Soal Uraian` : "Murni Pilihan Ganda"}
                            </p>
                          </div>

                          <Button
                            size="sm"
                            variant={hasUngraded ? "default" : "outline"}
                            className={hasUngraded ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}
                            onClick={() => handleOpenAttempt(sub.attemptId)}
                          >
                            <GraduationCap className="h-4 w-4 mr-1.5" />
                            {hasUngraded ? "Periksa Jawaban" : "Lihat Detail"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* ================= VIEW 2: GRADING ATTEMPT DETAIL ================= */
            <div className="space-y-6">
              {isLoadingDetail || !attemptDetail ? (
                <div className="text-center py-12 text-muted-foreground">
                  Memuat detail pengerjaan siswa...
                </div>
              ) : (
                <>
                  {/* Student & Score Banner */}
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="h-12 w-12 rounded-full bg-primary/20 text-primary font-bold text-lg flex items-center justify-center shrink-0">
                            {(
                              attemptDetail.user?.name ||
                              (attemptDetail as any).studentName ||
                              (attemptDetail as any).student?.name ||
                              "S"
                            ).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-foreground">
                              {attemptDetail.user?.name ||
                                (attemptDetail as any).studentName ||
                                (attemptDetail as any).student?.name ||
                                "Siswa"}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {attemptDetail.user?.email ||
                                (attemptDetail as any).studentEmail ||
                                (attemptDetail as any).student?.email ||
                                "-"} • Dikumpulkan:{" "}
                              {attemptDetail.submittedAt
                                ? new Date(attemptDetail.submittedAt).toLocaleString("id-ID")
                                : "-"}
                            </p>
                          </div>
                        </div>

                        {/* Summary Badges */}
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-background border text-center min-w-[90px]">
                            <span className="text-[11px] text-muted-foreground block font-medium">MCQ</span>
                            <span className="text-base font-bold text-foreground">
                              {attemptDetail.mcqScore !== null ? attemptDetail.mcqScore : "-"}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-background border text-center min-w-[110px]">
                            <span className="text-[11px] text-muted-foreground block font-medium">Total Poin</span>
                            <span className="text-base font-bold text-foreground">
                              {attemptDetail.totalEarnedPoints} / {attemptDetail.totalMaxPoints}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/30 text-center min-w-[110px]">
                            <span className="text-[11px] text-primary block font-medium">Nilai Akhir</span>
                            <span className="text-base font-bold text-primary">
                              {attemptDetail.isGraded
                                ? `${attemptDetail.finalScore ?? attemptDetail.percentage ?? 0}`
                                : "Belum Lengkap"}
                            </span>
                          </div>

                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs px-2.5 py-1",
                              attemptDetail.isGraded
                                ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-950/40"
                                : "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/40"
                            )}
                          >
                            {attemptDetail.gradingStatus}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground flex items-center justify-between flex-wrap gap-2">
                        <span>
                          Rumus Penilaian: (Total Skor Diperoleh / Total Skor Maksimal Seluruh Soal) × 100
                        </span>
                        <span>
                          Passing Grade: {attemptDetail.passingGrade}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Questions to Grade */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-base text-foreground">
                        Daftar Soal & Jawaban Siswa
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {attemptDetail.questions.length} total soal
                      </span>
                    </div>

                    {attemptDetail.questions.map((q, idx) => {
                      const isEssay = q.type === "Essay";
                      const gradeData = essayGrades[q.questionId] || { score: "", feedback: "" };

                      return (
                        <Card
                          key={q.questionId}
                          className={cn(
                            "border-2",
                            isEssay
                              ? "border-amber-200 dark:border-amber-900/60"
                              : "border-border"
                          )}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-semibold">
                                  #{idx + 1}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className={isEssay ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" : ""}
                                >
                                  {isEssay ? "Uraian (Essay)" : "Pilihan Ganda"}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  Skor Maksimal: <strong className="text-foreground">{q.maxPoints} Poin</strong>
                                </span>
                              </div>
                            </div>

                            <div className="mt-2 text-foreground font-medium prose prose-slate dark:prose-invert max-w-none text-base">
                              <div dangerouslySetInnerHTML={{ __html: q.question }} />
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            {/* Optional Instructions */}
                            {q.instructions && (
                              <div className="p-3 bg-muted/40 rounded-lg text-xs border">
                                <span className="font-semibold block mb-0.5 text-muted-foreground uppercase tracking-wider">
                                  Instruksi:
                                </span>
                                <p className="whitespace-pre-line text-foreground/90">{q.instructions}</p>
                              </div>
                            )}

                            {/* Optional Rubric for Teacher Reference */}
                            {isEssay && q.rubric && (
                              <div className="p-3 bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg text-xs">
                                <span className="font-semibold block mb-0.5 text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1">
                                  <HelpCircle className="h-3.5 w-3.5" />
                                  Rubrik / Pedoman Penilaian (Panduan Guru):
                                </span>
                                <p className="whitespace-pre-line text-foreground/90">{q.rubric}</p>
                              </div>
                            )}

                            {/* Answer Section */}
                            {isEssay ? (
                              /* ESSAY QUESTION: STUDENT ANSWER & TEACHER SCORING */
                              <div className="space-y-4 pt-2">
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Jawaban Siswa:
                                  </Label>
                                  <div className="p-4 rounded-lg border bg-muted/30 whitespace-pre-line text-sm leading-relaxed text-foreground">
                                    {q.studentAnswer || (
                                      <span className="italic text-muted-foreground">
                                        (Siswa tidak mengisi jawaban untuk soal ini)
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Teacher Score Input & Feedback */}
                                <div className="p-4 rounded-lg border bg-amber-50/30 dark:bg-amber-950/10 space-y-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                      <Label
                                        htmlFor={`score-${q.questionId}`}
                                        className="text-xs font-semibold"
                                      >
                                        Nilai / Skor (0 - {q.maxPoints}) <span className="text-destructive">*</span>
                                      </Label>
                                      <Input
                                        id={`score-${q.questionId}`}
                                        type="number"
                                        min="0"
                                        max={q.maxPoints}
                                        step="0.5"
                                        placeholder={`0 - ${q.maxPoints}`}
                                        value={gradeData.score}
                                        onChange={(e) =>
                                          handleScoreChange(q.questionId, e.target.value)
                                        }
                                        className="font-bold text-base"
                                      />
                                    </div>

                                    <div className="sm:col-span-2 space-y-1.5">
                                      <Label
                                        htmlFor={`feedback-${q.questionId}`}
                                        className="text-xs font-semibold"
                                      >
                                        Catatan / Feedback untuk Siswa <span className="text-xs text-muted-foreground">(Opsional)</span>
                                      </Label>
                                      <Textarea
                                        id={`feedback-${q.questionId}`}
                                        placeholder="Berikan apresiasi, koreksi, atau saran perbaikan..."
                                        value={gradeData.feedback}
                                        onChange={(e) =>
                                          handleFeedbackChange(q.questionId, e.target.value)
                                        }
                                        rows={2}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* MCQ QUESTION: READ ONLY AUTO-GRADED */
                              <div className="space-y-2 pt-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  Hasil Pilihan Ganda (Otomatis):
                                </Label>
                                <div className="space-y-2">
                                  {q.allChoices?.map((choice) => {
                                    const isChosen = q.selectedAnswers?.some((sa) => sa.id === choice.id);
                                    const isCorrect = choice.isCorrect;

                                    return (
                                      <div
                                        key={choice.id}
                                        className={cn(
                                          "flex items-center justify-between p-3 rounded-md border text-sm",
                                          isCorrect && "bg-green-50/60 border-green-400 dark:bg-green-950/20",
                                          isChosen && !isCorrect && "bg-red-50/60 border-red-400 dark:bg-red-950/20"
                                        )}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div
                                            className={cn(
                                              "w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px]",
                                              isChosen ? "border-primary bg-primary text-white" : "border-muted-foreground"
                                            )}
                                          />
                                          <span>{choice.answer}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                          {isChosen && (
                                            <Badge variant="outline" className="text-xs">
                                              Jawaban Siswa
                                            </Badge>
                                          )}
                                          {isCorrect && (
                                            <Badge variant="default" className="text-xs bg-green-600">
                                              Kunci Benar
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="text-right text-xs font-semibold text-muted-foreground mt-1">
                                  Skor diperoleh: {q.score ?? 0} / {q.maxPoints} Poin
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Grading Bottom Actions */}
                  <div className="sticky bottom-0 bg-background border-t p-4 flex items-center justify-between rounded-lg shadow-lg">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedAttemptId(null);
                        setAttemptDetail(null);
                      }}
                      disabled={isSavingGrades}
                    >
                      Batal / Kembali
                    </Button>

                    <Button
                      onClick={handleSaveGrading}
                      disabled={isSavingGrades}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Save className="h-4 w-4 mr-1.5" />
                      {isSavingGrades ? "Menyimpan Nilai..." : "Simpan Hasil Penilaian"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default QuizGradingModal;
