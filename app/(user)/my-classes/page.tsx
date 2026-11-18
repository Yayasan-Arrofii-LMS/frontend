"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useRecommendations } from "@/hooks/use-recommendations";
import { toast } from "sonner";
import {
  BookOpen,
  Users,
  GraduationCap,
  Sparkles,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

// Recommendation types
import {
  InterestTopic,
  RecommendedMaterial,
  RecommendationType,
} from "@/types/recommendation";

// Modular recommendation components
import { ActivitySummaryCard } from "@/components/recommendation/activity-summary-card";
import { InterestSelector } from "@/components/recommendation/interest-selector";
import { MaterialCard } from "@/components/recommendation/material-card";
import { RemedialSection } from "@/components/recommendation/remedial-section";
import { AdvancedLearningSection } from "@/components/recommendation/advanced-learning-section";
import { HistorySection } from "@/components/recommendation/history-section";
import { WhyRecommendedDialog } from "@/components/recommendation/why-recommended-dialog";
import { MaterialPreviewDialog } from "@/components/recommendation/material-preview-dialog";

export default function MyClassesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Integrated Recommendation & Enrollment Hook
  const {
    classes,
    materials,
    historyItems,
    categories,
    selectedInterestNames,
    remedialData,
    advancedData,
    stats,
    feedbacks,
    interactionStatuses,
    isLoading,
    isFilterLoading,
    isError,
    errorMessage,
    activeFilter,
    handleFilterChange,
    handleSaveInterests,
    handleFeedbackChange,
    handleViewMaterial: hookHandleViewMaterial,
    handleMarkCompleted,
    refetch,
  } = useRecommendations(isAuthenticated);

  // Dialog State
  const [whyMaterial, setWhyMaterial] = useState<RecommendedMaterial | null>(null);
  const [viewingMaterial, setViewingMaterial] = useState<RecommendedMaterial | null>(null);

  // Auth Protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Silakan login terlebih dahulu");
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Handler view material with modal dialog
  const handleViewMaterial = (material: RecommendedMaterial) => {
    setViewingMaterial(material);
    hookHandleViewMaterial(material);
  };

  // Navigasi langsung ke halaman materi dari kelas rekomendasi
  const handleNavigateToMaterial = (material: RecommendedMaterial) => {
    setViewingMaterial(null);
    handleMarkCompleted(material.id);

    let targetClassId = material.classId;
    const targetMaterialId =
      material.materialNumericId ||
      parseInt(
        material.id
          .replace("rec-", "")
          .replace("rem-", "")
          .replace("adv-", "")
          .replace("hist-", "")
      );

    // Jika classId belum ada di material, temukan dari relasi section kelas terdaftar
    if (!targetClassId && classes.length > 0) {
      if (material.sectionId) {
        const matchingClass = classes.find((c) =>
          c.class.Section?.some((s) => s.id === material.sectionId)
        );
        if (matchingClass) {
          targetClassId = matchingClass.classId;
        }
      }
      if (!targetClassId && classes.length === 1) {
        targetClassId = classes[0].classId;
      }
    }

    if (targetClassId && !isNaN(targetMaterialId)) {
      router.push(`/classes/${targetClassId}/materials/${targetMaterialId}?from=my-classes`);
    } else {
      toast.error("Kelas untuk materi ini tidak ditemukan atau belum terdaftar");
    }
  };

  // Find corresponding material for Spotlight sections
  const remedialMaterial = useMemo(() => {
    if (!remedialData) return undefined;
    const found = materials.find(
      (m) =>
        m.id === remedialData.recommendedMaterialId ||
        (remedialData.materialNumericId &&
          m.materialNumericId === remedialData.materialNumericId)
    );
    if (found) {
      return {
        ...found,
        classId: found.classId || remedialData.classId,
        sectionId: found.sectionId || remedialData.sectionId,
      };
    }
    return {
      id: remedialData.recommendedMaterialId,
      materialNumericId: remedialData.materialNumericId,
      classId: remedialData.classId,
      sectionId: remedialData.sectionId,
      title: remedialData.materialTitle,
      category: remedialData.category,
      mediaType: remedialData.mediaType,
      durationMinutes: remedialData.durationMinutes,
      description: remedialData.description,
      difficulty: "Pemula",
      thumbnail:
        "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
      recommendationType: "Remedial",
      reason: remedialData.reason,
      detailedReason: {
        overview: remedialData.description,
        targetCompetency: remedialData.competency,
        learningPathMatch: "Materi Penguatan Remedial",
        interestRelevance: "Prioritas Remedial",
      },
      contentPreview: {
        summary: remedialData.description,
        keyPoints: [
          `Penguatan materi pada kompetensi ${remedialData.competency}`,
          `Target nilai ketuntasan: ${remedialData.targetScore}`,
        ],
        practicalExercise: `Pelajari kembali materi "${remedialData.materialTitle}" untuk memperkuat pemahaman.`,
      },
    } satisfies RecommendedMaterial;
  }, [materials, remedialData]);

  const advancedMaterial = useMemo(() => {
    if (!advancedData) return undefined;
    const found = materials.find(
      (m) =>
        m.id === advancedData.recommendedMaterialId ||
        (advancedData.materialNumericId &&
          m.materialNumericId === advancedData.materialNumericId)
    );
    if (found) {
      return {
        ...found,
        classId: found.classId || advancedData.classId,
        sectionId: found.sectionId || advancedData.sectionId,
      };
    }
    return {
      id: advancedData.recommendedMaterialId,
      materialNumericId: advancedData.materialNumericId,
      classId: advancedData.classId,
      sectionId: advancedData.sectionId,
      title: advancedData.nextMaterialTitle,
      category: advancedData.category,
      mediaType: advancedData.mediaType,
      durationMinutes: advancedData.durationMinutes,
      description: advancedData.description,
      difficulty: "Menengah",
      thumbnail:
        "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80",
      recommendationType: "Materi Lanjutan",
      reason: advancedData.description,
      detailedReason: {
        overview: advancedData.description,
        targetCompetency: advancedData.competencyAchieved,
        learningPathMatch: `Melanjutkan materi setelah ${advancedData.previousMaterial}`,
        interestRelevance: "Jalur Pembelajaran Terbuka",
      },
      contentPreview: {
        summary: advancedData.description,
        keyPoints: [
          `Kompetensi prasyarat terpenuhi: ${advancedData.competencyAchieved}`,
          `Topik lanjutan: ${advancedData.nextMaterialTitle}`,
        ],
        practicalExercise: `Mulai pelajari materi "${advancedData.nextMaterialTitle}" sebagai langkah belajar selanjutnya.`,
      },
    } satisfies RecommendedMaterial;
  }, [materials, advancedData]);

  // Sort: materials matching selected interests come first
  const displayMaterials = useMemo(() => {
    if (selectedInterestNames.length === 0) {
      return materials;
    }
    return [...materials].sort((a, b) => {
      const aMatches = selectedInterestNames.includes(a.category) ? 1 : 0;
      const bMatches = selectedInterestNames.includes(b.category) ? 1 : 0;
      return bMatches - aMatches;
    });
  }, [materials, selectedInterestNames]);

  // Loading skeleton state
  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader className="p-4 pb-2">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-3">
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state with retry action
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Gagal Memuat Kelas & Rekomendasi</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {errorMessage || "Terjadi kendala saat menghubungkan ke server API. Silakan periksa koneksi Anda dan coba lagi."}
        </p>
        <Button
          onClick={() => refetch()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium"
        >
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </Button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* 1. Header Kelas Saya */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Kelas Saya
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
              Daftar kelas yang sedang Anda ikuti.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Ringkasan Aktivitas dan Progres Belajar (Aktivitas Rekomendasimu) */}
      <ActivitySummaryCard stats={stats} />

      {/* 3 & 4. Daftar Kelas yang Diikuti ATAU Empty State jika belum ada kelas */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-bold tracking-tight">
              Kelas Terdaftar
            </h2>
            {classes.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {classes.length} Kelas
              </Badge>
            )}
          </div>
          {classes.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => router.push("/classes")}
            >
              Jelajahi Kelas Lainnya
            </Button>
          )}
        </div>

        {classes.length === 0 ? (
          /* 4. Empty State: Tampilan Utama jika Siswa Belum Memiliki Kelas */
          <Card className="py-14 border-dashed border-2 border-border/80 bg-muted/20">
            <CardContent className="text-center max-w-md mx-auto">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-foreground">
                Belum Ada Kelas
              </h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Anda belum mendaftar ke kelas apapun. Mulai belajar dengan
                mendaftar ke kelas yang tersedia.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6"
                  onClick={() => router.push("/classes")}
                >
                  Jelajahi Kelas
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const el = document.getElementById("rekomendasi-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-xs"
                >
                  Lihat Rekomendasi di Bawah
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* 3. Daftar Kelas Grid jika Siswa Memiliki Kelas */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((enrollment) => {
              const classData = enrollment.class;
              const imageUrl = classData.image_path?.startsWith("http")
                ? classData.image_path
                : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(
                  "/api/v1",
                  ""
                )}/${classData.image_path}`;

              // Progress calculation: prioritas data API, fallback default 0% jika backend belum sediakan agregat progres
              const rawProgress =
                enrollment.progress ??
                enrollment.progressPercentage ??
                classData.progress;
              const progress =
                typeof rawProgress === "number"
                  ? Math.min(100, Math.max(0, Math.round(rawProgress)))
                  : 0;

              const isCompleted = progress === 100;
              const isStarted = progress > 0;

              return (
                <Card
                  key={enrollment.id}
                  className="overflow-hidden hover:shadow-lg transition-all cursor-pointer border-border/80 group flex flex-col justify-between"
                  onClick={() => router.push(`/classes/${classData.id}?from=my-classes`)}
                >
                  <div>
                    {/* Cover Image */}
                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                      <Image
                        src={imageUrl || "/placeholder.svg"}
                        alt={classData.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Status Progress Badge di kiri atas */}
                      <div className="absolute top-2.5 left-2.5">
                        {isCompleted ? (
                          <Badge className="bg-emerald-600/90 hover:bg-emerald-600 text-white gap-1 text-[11px] font-semibold backdrop-blur shadow-sm border-0">
                            <CheckCircle2 className="h-3 w-3" />
                            Tuntas
                          </Badge>
                        ) : isStarted ? (
                          <Badge
                            variant="secondary"
                            className="bg-background/90 backdrop-blur text-emerald-700 dark:text-emerald-400 gap-1 text-[11px] font-medium shadow-sm border border-emerald-500/20"
                          >
                            <Clock className="h-3 w-3" />
                            Sedang Belajar
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-background/90 backdrop-blur text-muted-foreground text-[11px] font-medium shadow-sm"
                          >
                            Belum Mulai
                          </Badge>
                        )}
                      </div>

                      {/* Role Badge di kanan atas */}
                      <div className="absolute top-2.5 right-2.5">
                        <Badge
                          variant="secondary"
                          className="bg-background/90 backdrop-blur font-medium text-xs shadow-sm capitalize"
                        >
                          {enrollment.role.toLowerCase()}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base font-bold line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {classData.name}
                      </CardTitle>
                      <CardDescription className="text-xs line-clamp-2 mt-1">
                        {classData.description}
                      </CardDescription>
                    </CardHeader>
                  </div>

                  <CardContent className="p-4 pt-1 space-y-3">
                    {/* Progres Belajar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                          <GraduationCap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          Progres Belajar
                        </span>
                        <span
                          className={`font-bold ${isCompleted
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-foreground"
                            }`}
                        >
                          {progress}%
                        </span>
                      </div>
                      <Progress
                        value={progress}
                        className="h-2 bg-muted/80"
                        indicatorClassName={
                          isCompleted
                            ? "bg-emerald-600 dark:bg-emerald-500"
                            : progress >= 50
                              ? "bg-emerald-600 dark:bg-emerald-500"
                              : "bg-emerald-500/80 dark:bg-emerald-400"
                        }
                      />
                    </div>

                    {/* Meta Info Section & Siswa */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                      <div className="flex items-center gap-1.5 font-medium">
                        <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{classData.Section?.length || 0} Section</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Users className="h-3.5 w-3.5 text-emerald-600" />
                        <span>
                          {classData._count?.User_Class || 0} Siswa
                        </span>
                      </div>
                    </div>

                    {/* Tombol / Tautan Aksi Lanjutkan Belajar */}
                    <div className="pt-1 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                      <span>{isCompleted ? "Tinjau Kelas" : "Lanjutkan Belajar"}</span>
                      <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>


      {/*  Rekomendasi Remedial ("Perkuat Pemahamanmu") */}
      {remedialData && (
        <RemedialSection
          remedialData={remedialData}
          material={remedialMaterial}
          onViewMaterial={handleViewMaterial}
        />
      )}

      {/*  Personalisasi Minat Pembelajaran ("Minat Belajarmu") */}
      <InterestSelector
        selectedInterests={selectedInterestNames as InterestTopic[]}
        onSaveInterests={(newInterests) => handleSaveInterests(newInterests as string[])}
        availableCategories={categories}
      />

      {/*  Rekomendasi Materi untuk Siswa ("Rekomendasi untukmu") */}
      <section id="rekomendasi-section" className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Rekomendasi untukmu
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Temukan materi yang sesuai dengan minat dan perjalanan belajarmu.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs text-muted-foreground font-medium hidden lg:inline mr-1 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              Filter:
            </span>
            {(
              [
                "Semua",
                "Berdasarkan Minat",
                "Berdasarkan Progres",
                "Remedial",
                "Materi Lanjutan",
              ] as const
            ).map((filter) => (
              <Button
                key={filter}
                type="button"
                variant={activeFilter === filter ? "default" : "outline"}
                size="sm"
                disabled={isFilterLoading}
                className={`h-8 text-xs font-medium whitespace-nowrap transition-all ${activeFilter === filter
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  : "border-border/80 hover:bg-muted"
                  } ${isFilterLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                onClick={() => handleFilterChange(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        {/* Status Filter Minat Info */}
        {selectedInterestNames.length > 0 && activeFilter === "Berdasarkan Minat" && (
          <div className="mb-5 p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 flex items-center justify-between text-xs">
            <span className="text-emerald-800 dark:text-emerald-300">
              Menampilkan materi prioritas berdasarkan minat aktif:{" "}
              <strong>{selectedInterestNames.join(", ")}</strong>
            </span>
            <button
              type="button"
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
              onClick={() => {
                const el = document.getElementById("minat-belajar-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Ubah Minat
            </button>
          </div>
        )}

        {/* Responsive Grid: Desktop 3 cols, Tablet 2 cols, Mobile 1 col */}
        {isFilterLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden border border-border/80 flex flex-col justify-between">
                <div>
                  <Skeleton className="h-44 w-full" />
                  <div className="p-4 space-y-3">
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-24 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-2/3" />
                  </div>
                </div>
                <div className="p-4 pt-0 border-t border-border/60 mt-4 flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </Card>
            ))}
          </div>
        ) : displayMaterials.length === 0 ? (
          <Card className="py-12 text-center border-dashed bg-muted/10">
            <CardContent className="space-y-3">
              <Sparkles className="h-10 w-10 mx-auto text-muted-foreground" />
              <h3 className="text-base font-bold text-foreground">
                Belum Ada Materi untuk Filter Ini
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Silakan pilih kategori filter lain atau sesuaikan preferensi topik di bagian Minat Belajar.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => handleFilterChange("Semua")}
              >
                Tampilkan Semua Rekomendasi
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayMaterials.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
                currentFeedback={feedbacks[material.id]}
                currentStatus={interactionStatuses[material.id]}
                onWhyClick={(m) => setWhyMaterial(m)}
                onViewMaterial={handleViewMaterial}
                onFeedbackChange={handleFeedbackChange}
              />
            ))}
          </div>
        )}
      </section>

      {/* Rekomendasi Materi Lanjutan ("Lanjutkan Perjalanan Belajarmu") */}
      {advancedData && (
        <AdvancedLearningSection
          advancedData={advancedData}
          material={advancedMaterial}
          onViewMaterial={handleViewMaterial}
        />
      )}

      {/*  Riwayat dan Feedback Rekomendasi */}
      <HistorySection
        historyItems={historyItems}
        allMaterials={materials}
        onViewMaterial={handleViewMaterial}
      />

      {/* Popover / Dialog: "Mengapa direkomendasikan?" */}
      <WhyRecommendedDialog
        material={whyMaterial}
        open={!!whyMaterial}
        onOpenChange={(open) => !open && setWhyMaterial(null)}
      />

      {/* Dialog Preview Materi ("Lihat Materi" / "Pelajari Kembali") */}
      <MaterialPreviewDialog
        material={viewingMaterial}
        open={!!viewingMaterial}
        onOpenChange={(open) => !open && setViewingMaterial(null)}
        currentFeedback={viewingMaterial ? feedbacks[viewingMaterial.id] : undefined}
        currentStatus={viewingMaterial ? interactionStatuses[viewingMaterial.id] : undefined}
        onFeedbackChange={handleFeedbackChange}
        onMarkCompleted={handleMarkCompleted}
        onNavigateToMaterial={handleNavigateToMaterial}
      />
    </div>
  );
}
