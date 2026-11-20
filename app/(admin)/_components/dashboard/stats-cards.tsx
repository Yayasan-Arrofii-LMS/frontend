"use client";

import { DashboardData } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  GraduationCap,
  BookOpen,
  Compass,
  FileQuestion,
  FileText,
  UserCheck,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

interface StatsCardsProps {
  data: DashboardData;
}

interface MetricCardProps {
  title: string;
  value: number | string;
  changePercent?: number;
  subtitle: string;
  icon: React.ReactNode;
  iconBgColor?: string;
}

function MetricCard({
  title,
  value,
  changePercent,
  subtitle,
  icon,
  iconBgColor = "bg-primary/10 text-primary",
}: MetricCardProps) {
  const isPositive = (changePercent || 0) > 0;
  const isNegative = (changePercent || 0) < 0;
  const isNeutral = (changePercent || 0) === 0;

  return (
    <Card className="rounded-2xl border shadow-xs hover:shadow-sm transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${iconBgColor}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums">
            {typeof value === "number" ? value.toLocaleString("id-ID") : value}
          </div>

          {changePercent !== undefined && (
            <Badge
              variant="outline"
              className={`text-[11px] font-semibold gap-1 px-1.5 py-0.5 border ${
                isPositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : isNegative
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {isPositive && <TrendingUp className="h-3 w-3" />}
              {isNegative && <TrendingDown className="h-3 w-3" />}
              {isNeutral && <Minus className="h-3 w-3" />}
              {isPositive ? `+${changePercent}%` : `${changePercent}%`}
            </Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground line-clamp-1">
          {subtitle}
        </p>
      </CardContent>
    </Card>
  );
}

export function StatsCards({ data }: StatsCardsProps) {
  const overview = data.overview;

  // Fallbacks if overview is not yet loaded
  const studentCount = overview?.students.current ?? data.studentCount ?? 0;
  const teacherCount = overview?.teachers.current ?? data.teacherCount ?? 0;
  const classCount = overview?.classes.current ?? data.classCount ?? 0;
  const workshopCount = overview?.workshops.current ?? data.workshopStats?.total ?? 0;

  const quizAttempts = overview?.quizAttempts.current ?? 0;
  const assignmentsSubmitted = overview?.assignmentsSubmitted.current ?? 0;
  const workshopRegistrations = overview?.workshopRegistrations.current ?? data.workshopStats?.participantsTotal ?? 0;
  const avgQuizScore = overview?.averageQuizScore.current ?? 0;

  return (
    <div className="space-y-4">
      {/* Baris 1: Pengguna & Program Pembelajaran */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Siswa (Siswa + Guru)"
          value={studentCount}
          changePercent={overview?.students.changePercent}
          subtitle={`Total pembelajar: ${(overview?.students.totalCumulative ?? data.studentCount).toLocaleString("id-ID")} orang`}
          icon={<Users className="h-4 w-4" />}
          iconBgColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />

        <MetricCard
          title="Guru / Fasilitator"
          value={teacherCount}
          changePercent={overview?.teachers.changePercent}
          subtitle={`Total akumulatif: ${(overview?.teachers.totalCumulative ?? data.teacherCount).toLocaleString("id-ID")} pengajar`}
          icon={<GraduationCap className="h-4 w-4" />}
          iconBgColor="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />

        <MetricCard
          title="Kelas Baru"
          value={classCount}
          changePercent={overview?.classes.changePercent}
          subtitle={`Total aktif: ${(overview?.classes.totalCumulative ?? data.classCount).toLocaleString("id-ID")} kelas`}
          icon={<BookOpen className="h-4 w-4" />}
          iconBgColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />

        <MetricCard
          title="Workshop Baru"
          value={workshopCount}
          changePercent={overview?.workshops.changePercent}
          subtitle={`Total program: ${(overview?.workshops.totalCumulative ?? data.workshopStats?.total ?? 0).toLocaleString("id-ID")} kegiatan`}
          icon={<Compass className="h-4 w-4" />}
          iconBgColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Baris 2: Aktivitas & Evaluasi Belajar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Pengerjaan Kuis"
          value={quizAttempts}
          changePercent={overview?.quizAttempts.changePercent}
          subtitle="Sesi pengerjaan kuis siswa"
          icon={<FileQuestion className="h-4 w-4" />}
          iconBgColor="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
        />

        <MetricCard
          title="Tugas Terkumpul"
          value={assignmentsSubmitted}
          changePercent={overview?.assignmentsSubmitted.changePercent}
          subtitle="Pengumpulan berkas tugas siswa"
          icon={<FileText className="h-4 w-4" />}
          iconBgColor="bg-teal-500/10 text-teal-600 dark:text-teal-400"
        />

        <MetricCard
          title="Pendaftaran Workshop"
          value={workshopRegistrations}
          changePercent={overview?.workshopRegistrations.changePercent}
          subtitle="Pengajuan peserta kegiatan"
          icon={<UserCheck className="h-4 w-4" />}
          iconBgColor="bg-rose-500/10 text-rose-600 dark:text-rose-400"
        />

        <MetricCard
          title="Rata-rata Skor Kuis"
          value={avgQuizScore > 0 ? `${avgQuizScore}` : "0"}
          changePercent={overview?.averageQuizScore.changePercent}
          subtitle="Skor akhir evaluasi kuis"
          icon={<Award className="h-4 w-4" />}
          iconBgColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
      </div>
    </div>
  );
}
