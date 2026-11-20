"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { fetchPublicClasses } from "@/lib/api/classes";
import { Class } from "@/types/class";
import { Reveal } from "@/hooks/use-scroll-reveal";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { ClassCoverImage } from "@/components/class/class-cover-image";
import { TeacherApplicationModal } from "@/components/teacher";

// Icons
import {
  ArrowRight,
  BookOpen,
  Users,
  GraduationCap,
  CalendarDays,
  FileQuestion,
  Leaf,
  Sparkles,
  HeartHandshake,
  Compass,
} from "lucide-react";

export default function HomePage() {
  const currentYear = new Date().getFullYear();
  const { isLoading, isAuthenticated } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showTeacherPortalDialog, setShowTeacherPortalDialog] = useState(false);
  const [showTeacherApplicationModal, setShowTeacherApplicationModal] = useState(false);
  const router = useRouter();

  const handleClassClick = (classId: string, e: React.MouseEvent) => {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      setShowLoginDialog(true);
    } else {
      router.push(`/classes/${classId}?from=home`);
    }
  };

  const handleLoginRedirect = () => {
    setShowLoginDialog(false);
    router.push("/login");
  };

  const handleTeacherPortalClick = () => {
    setShowTeacherPortalDialog(true);
  };

  const handleTeacherLogin = () => {
    setShowTeacherPortalDialog(false);
    router.push("/login");
  };

  const handleTeacherRegister = () => {
    setShowTeacherPortalDialog(false);
    setShowTeacherApplicationModal(true);
  };

  const handleStudentDashboardClick = () => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      setShowLoginDialog(true);
    } else {
      router.push("/classes");
    }
  };

  useEffect(() => {
    async function loadClasses() {
      try {
        setIsLoadingClasses(true);
        const { classes: publicClasses } = await fetchPublicClasses(1);
        // Show first 8 classes for featured section
        setClasses(publicClasses.slice(0, 8));
      } catch (error) {
        console.error("Gagal memuat kelas:", error);
        toast.error("Gagal memuat kelas");
        setClasses([]);
      } finally {
        setIsLoadingClasses(false);
      }
    }

    loadClasses();
  }, []);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground scroll-smooth">
      {/* =========================================================
          SECTION A: HERO SECTION
          ========================================================= */}
      <section className="relative px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28 overflow-hidden">
        {/* Soft Decorative Ambient Background Glow with gentle breathing */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
        >
          <div className="h-[360px] w-[360px] sm:h-[520px] sm:w-[520px] rounded-full bg-primary/10 blur-3xl opacity-70 dark:opacity-40 animate-pulse" />
          <div className="absolute top-1/4 -right-12 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl opacity-50" />
        </div>

        <div className="mx-auto max-w-5xl text-center">
          {/* Natural Pill Badge */}
          <Reveal direction="down" delay={50} distance={15}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs sm:text-sm font-medium text-foreground backdrop-blur-xs transition-all duration-300 hover:border-primary/40 hover:bg-primary/10">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>Sekolah Alam Learning Management System</span>
            </div>
          </Reveal>

          {/* Main Headline */}
          <Reveal direction="up" delay={120} distance={20}>
            <h1 className="mb-6 text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Eksplorasi Belajar & Berbagi{" "}
              <span className="bg-gradient-to-r from-primary via-emerald-600 to-primary bg-clip-text text-transparent dark:via-emerald-400">
                Pengetahuan Alam
              </span>
            </h1>
          </Reveal>

          {/* Subtitle Description */}
          <Reveal direction="up" delay={220} distance={20}>
            <p className="mx-auto mb-8 sm:mb-10 max-w-3xl text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed px-2">
              Platform pembelajaran modern berbasis lingkungan hidup, sains praktikal, dan
              keterampilan mandiri. Didesain untuk mempertemukan pendidik berdedikasi
              dengan siswa yang haus eksplorasi nyata.
            </p>
          </Reveal>

          {/* Hero CTAs */}
          <Reveal direction="up" delay={320} distance={15}>
            {!isLoading && !isAuthenticated ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base px-7 shadow-md group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
                  asChild
                >
                  <Link href="/classes">
                    Jelajahi Kelas
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-base px-7 border-border hover:bg-muted transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
                  asChild
                >
                  <Link href="/workshops">Jelajahi Workshop</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base px-7 shadow-md group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
                  asChild
                >
                  <Link href="/classes">
                    Jelajahi Kelas
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-base px-7 border-border hover:bg-muted transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
                  asChild
                >
                  <Link href="/workshops">Jelajahi Workshop</Link>
                </Button>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* =========================================================
          SECTION B: FITUR UNGGULAN LMS
          (Tepat setelah Hero & Sebelum Kelas Unggulan)
          ========================================================= */}
      <section className="border-t border-border/60 bg-muted/30 px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <Reveal direction="up" delay={50}>
            <div className="mb-12 text-center max-w-2xl mx-auto">
              <Badge variant="outline" className="mb-3 text-xs font-semibold text-primary border-primary/30 uppercase tracking-wider">
                Fitur Unggulan LMS
              </Badge>
              <h2 className="mb-3 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                Ekosistem Belajar Lengkap & Terpadu
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Didesain khusus untuk menghadirkan pengalaman belajar yang menyenangkan,
                aplikatif, dan terstruktur sesuai kebutuhan siswa.
              </p>
            </div>
          </Reveal>

          {/* 3 Feature Cards with Staggered Scroll Reveal and Lift Effect */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Feature 1: Kelas Pembelajaran */}
            <Reveal direction="up" delay={100} distance={24} className="h-full">
              <Card className="group h-full rounded-2xl border-border/70 bg-card hover:border-primary/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                      <BookOpen className="h-6 w-6 transition-transform duration-300 group-hover:rotate-3" />
                    </div>
                    <Badge variant="secondary" className="text-xs font-medium">
                      Modul Terstruktur
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                      Kelas Pembelajaran
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      Temukan dan ikuti beragam kelas tematik mulai dari sains alam, pertanian ramah lingkungan, hingga keterampilan hidup praktis bersama para pendidik.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="ghost" className="p-0 text-primary hover:text-primary/80 font-semibold text-sm group/btn" asChild>
                    <Link href="/classes" className="inline-flex items-center">
                      Jelajahi Kelas
                      <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </Reveal>

            {/* Feature 2: Kuis Interaktif */}
            <Reveal direction="up" delay={220} distance={24} className="h-full">
              <Card className="group h-full rounded-2xl border-border/70 bg-card hover:border-primary/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                      <FileQuestion className="h-6 w-6 transition-transform duration-300 group-hover:rotate-3" />
                    </div>
                    <Badge variant="secondary" className="text-xs font-medium">
                      Latihan & Uraian
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                      Kuis Interaktif
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      Uji dan pertajam pemahaman materi melalui latihan pilihan ganda serta soal uraian (essay) dengan penilaian langsung dan umpan balik personal dari guru.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="ghost" className="p-0 text-primary hover:text-primary/80 font-semibold text-sm group/btn" asChild>
                    <Link href="/classes" className="inline-flex items-center">
                      Cek Kelas & Kuis
                      <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </Reveal>

            {/* Feature 3: Workshop dan Kegiatan */}
            <Reveal direction="up" delay={340} distance={24} className="h-full">
              <Card className="group h-full rounded-2xl border-border/70 bg-card hover:border-primary/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                      <CalendarDays className="h-6 w-6 transition-transform duration-300 group-hover:rotate-3" />
                    </div>
                    <Badge variant="secondary" className="text-xs font-medium">
                      Praktik Lapangan
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                      Workshop & Kegiatan
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      Perdalam pengalaman empiris dengan mengikuti workshop tematik, sesi praktik langsung, dan kegiatan kolaboratif di lingkungan Sekolah Alam.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="ghost" className="p-0 text-primary hover:text-primary/80 font-semibold text-sm group/btn" asChild>
                    <Link href="/workshops" className="inline-flex items-center">
                      Jelajahi Workshop
                      <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION C: KELAS UNGGULAN
          ========================================================= */}
      <section className="px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          {/* Header with Title and "Lihat Semua" Link */}
          <Reveal direction="up" delay={50}>
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <Badge variant="outline" className="mb-2 text-xs font-semibold text-primary border-primary/30 uppercase tracking-wider">
                  Katalog Pilihan
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Kelas Unggulan</h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Jelajahi materi pembelajaran terpopuler dan mulai langkah belajarmu hari ini
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="self-start sm:self-auto group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs active:scale-[0.98]"
                asChild
              >
                <Link href="/classes">
                  Lihat Semua Kelas
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </Reveal>

          {/* Classes Horizontal Snap Scroll Container */}
          {isLoadingClasses ? (
            <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex gap-5" style={{ width: "max-content" }}>
                {[1, 2, 3, 4].map((i) => (
                  <Card
                    key={i}
                    className="overflow-hidden w-[290px] sm:w-[320px] flex-shrink-0 rounded-2xl border-border/70"
                  >
                    <Skeleton className="aspect-video w-full" />
                    <CardHeader className="p-4 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3.5 w-full" />
                      <Skeleton className="h-3.5 w-2/3" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : classes.length > 0 ? (
            <Reveal direction="up" delay={150}>
              <div className="overflow-x-auto pb-6 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth snap-x snap-mandatory">
                <div className="flex gap-5" style={{ width: "max-content" }}>
                  {classes.map((classItem) => (
                    <div
                      key={classItem.id}
                      onClick={(e) => handleClassClick(classItem.id, e)}
                      className="cursor-pointer snap-start"
                    >
                      <Card className="group overflow-hidden rounded-2xl border-border/70 bg-card hover:border-primary/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl w-[290px] sm:w-[320px] flex-shrink-0 flex flex-col justify-between h-full active:scale-[0.99]">
                        <div>
                          {/* Cover Image Container with Smooth Zoom on Hover */}
                          <div className="aspect-video w-full overflow-hidden bg-muted relative">
                            <div className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105">
                              <ClassCoverImage
                                src={classItem.coverImage}
                                alt={classItem.title}
                              />
                            </div>
                            {classItem.category && (
                              <div className="absolute top-3 left-3 z-10">
                                <Badge
                                  variant="secondary"
                                  className="backdrop-blur-md bg-background/85 font-semibold text-xs shadow-xs border-0"
                                >
                                  {typeof classItem.category === "string"
                                    ? classItem.category
                                    : classItem.category.name}
                                </Badge>
                              </div>
                            )}
                          </div>

                          {/* Card Info */}
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base font-bold line-clamp-1 group-hover:text-primary transition-colors">
                              {classItem.title}
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                              {classItem.description || "Materi pembelajaran tematik terstruktur."}
                            </CardDescription>
                          </CardHeader>
                        </div>

                        {/* Card Metadata Footer */}
                        <CardContent className="p-4 pt-2 border-t border-border/50 mt-3 flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5 truncate">
                            <Users className="h-3.5 w-3.5 shrink-0 text-primary" />
                            <span className="truncate">
                              {classItem.teacherName || "Pengajar Sekolah Alam"}
                            </span>
                          </div>
                          {classItem.studentCount !== undefined && classItem.studentCount > 0 && (
                            <span className="shrink-0 font-medium">
                              {classItem.studentCount} Siswa
                            </span>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ) : (
            <div className="text-center py-16 rounded-2xl border border-dashed border-border/80 bg-muted/20">
              <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
              <p className="font-medium text-foreground">Belum ada kelas yang dipublikasikan</p>
              <p className="text-xs text-muted-foreground mt-1">
                Silakan kunjungi kembali nanti untuk melihat materi terbaru.
              </p>
            </div>
          )}

          {/* Bottom Link for Mobile */}
          <div className="text-center mt-6 sm:hidden">
            <Button variant="outline" className="w-full active:scale-[0.98]" asChild>
              <Link href="/classes">
                Lihat Semua Kelas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION D: PORTAL GURU DAN SISWA
          ========================================================= */}
      <section className="border-t border-border/60 bg-muted/30 px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal direction="up" delay={50}>
            <div className="mb-12 text-center max-w-2xl mx-auto">
              <Badge variant="outline" className="mb-3 text-xs font-semibold text-primary border-primary/30 uppercase tracking-wider">
                Akses Berbasis Peran
              </Badge>
              <h2 className="mb-3 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                Portal Guru & Siswa
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Ruang kerja khusus untuk menunjang interaksi optimal antara pengajar dan pembelajar.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Student Portal Card */}
            <Reveal direction="up" delay={120} distance={24} className="h-full">
              <Card
                className="group h-full rounded-2xl border-border/70 bg-card hover:border-primary/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl p-6 sm:p-8 flex flex-col justify-between cursor-pointer active:scale-[0.99]"
                onClick={handleStudentDashboardClick}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                      <GraduationCap className="h-7 w-7" />
                    </div>
                    <Badge variant="outline" className="border-primary/30 text-primary font-semibold">
                      Untuk Siswa
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    Dasbor Siswa
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    Akses langsung seluruh kelas yang Anda ikuti, pelajari modul materi terarah, selesaikan latihan kuis interaktif, dan pantau catatan perkembangan belajar Anda di satu tempat.
                  </p>
                </div>

                <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">Buka Dasbor Siswa</span>
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:translate-x-1.5">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Card>
            </Reveal>

            {/* Teacher Portal Card */}
            <Reveal direction="up" delay={240} distance={24} className="h-full">
              <Card
                className="group h-full rounded-2xl border-border/70 bg-card hover:border-primary/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl p-6 sm:p-8 flex flex-col justify-between cursor-pointer active:scale-[0.99]"
                onClick={handleTeacherPortalClick}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-emerald-500/20">
                      <Users className="h-7 w-7" />
                    </div>
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold">
                      Untuk Guru & Pendidik
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    Portal Guru
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    Kelola kurikulum kelas Anda, pantau pengumpulan tugas siswa, lakukan penilaian manual untuk soal kuis uraian (essay), atau ajukan permohonan menjadi Guru di LMS Sekolah Alam.
                  </p>
                </div>

                <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">Buka Portal Guru</span>
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:translate-x-1.5">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION E: MENGAPA SEKOLAH ALAM? (VALUE PROPOSITION)
          ========================================================= */}
      <section className="px-4 sm:px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal direction="up" delay={50}>
            <div className="mb-14 text-center max-w-2xl mx-auto">
              <Badge variant="outline" className="mb-3 text-xs font-semibold text-primary border-primary/30 uppercase tracking-wider">
                Nilai & Karakter
              </Badge>
              <h2 className="mb-3 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                Mengapa Sekolah Alam?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Membangun kecerdasan komprehensif melalui pendekatan belajar yang kontekstual,
                harmonis dengan alam, dan berorientasi pada karakter mandiri.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Pillar 1 */}
            <Reveal direction="up" delay={100} distance={20} className="h-full">
              <div className="group h-full p-6 rounded-2xl border border-border/70 bg-card hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <Compass className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  Belajar dari Alam
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Mendorong proses pembelajaran melalui pengamatan dan pengalaman langsung dengan alam sekitar sebagai laboratorium kehidupan nyata.
                </p>
              </div>
            </Reveal>

            {/* Pillar 2 */}
            <Reveal direction="up" delay={220} distance={20} className="h-full">
              <div className="group h-full p-6 rounded-2xl border border-border/70 bg-card hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  Pembelajaran Kontekstual
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Menghubungkan teori sains dan pengetahuan umum dengan fenomena kehidupan sehari-hari serta pemecahan masalah yang nyata.
                </p>
              </div>
            </Reveal>

            {/* Pillar 3 */}
            <Reveal direction="up" delay={340} distance={20} className="h-full">
              <div className="group h-full p-6 rounded-2xl border border-border/70 bg-card hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <HeartHandshake className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  Kolaborasi & Kemandirian
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Melatih peserta didik untuk bekerja sama, saling berbagi ilmu, menumbuhkan jiwa kepemimpinan, dan membangun kemandirian sejati.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION F: CALL-TO-ACTION (CTA) BANNER
          ========================================================= */}
      <section className="px-4 sm:px-6 pb-20">
        <Reveal direction="up" delay={100} distance={24}>
          <div className="mx-auto max-w-6xl rounded-3xl p-8 sm:p-12 md:p-16 border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-emerald-500/5 relative overflow-hidden text-center shadow-xs transition-shadow duration-300 hover:shadow-md">
            {/* Decorative background circle with subtle breathing */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl animate-pulse"
            />

            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <Badge variant="outline" className="border-primary/40 bg-background/80 text-primary font-semibold text-xs">
                Mulai Langkah Belajar Anda
              </Badge>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                Siap Memulai Petualangan Belajar Bersama Sekolah Alam?
              </h2>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Bergabunglah sekarang untuk mengakses materi pembelajaran yang bermakna,
                mengasah keterampilan praktis, dan terhubung bersama komunitas pembelajar.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 text-base shadow-md group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
                  asChild
                >
                  <Link href="/classes">
                    Jelajahi Kelas
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-8 text-base border-border transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
                  asChild
                >
                  <Link href="/workshops">Lihat Workshop</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* =========================================================
          SECTION G: FOOTER
          ========================================================= */}
      <footer className="border-t border-border/60 bg-muted/20 px-4 py-8">
        <Reveal direction="none" delay={50}>
          <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>Sekolah Alam LMS</span>
            </div>
            <p>&copy; {currentYear} Sekolah Alam. Seluruh hak cipta dilindungi.</p>
          </div>
        </Reveal>
      </footer>

      {/* =========================================================
          DIALOGS & MODALS (PRESERVED LOGIC)
          ========================================================= */}
      {/* 1. Login Required Dialog */}
      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Login Diperlukan</AlertDialogTitle>
            <AlertDialogDescription>
              Anda harus login terlebih dahulu untuk melihat detail kelas.
              Silakan login atau buat akun baru untuk melanjutkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleLoginRedirect}>
              Login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 2. Teacher Portal Dialog */}
      <AlertDialog
        open={showTeacherPortalDialog}
        onOpenChange={setShowTeacherPortalDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Portal Guru</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda sudah memiliki akun guru atau ingin mengajukan permohonan
              menjadi guru baru?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Button onClick={handleTeacherLogin} className="w-full">
              Sudah Punya Akun (Login)
            </Button>
            <Button
              variant="outline"
              onClick={handleTeacherRegister}
              className="w-full"
            >
              Daftar Menjadi Guru
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="w-full sm:w-auto">
              Batal
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 3. Teacher Application Modal (Mailto flow) */}
      <TeacherApplicationModal
        isOpen={showTeacherApplicationModal}
        onClose={() => setShowTeacherApplicationModal(false)}
      />
    </div>
  );
}
