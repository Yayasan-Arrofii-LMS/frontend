"use client";

import { useState } from "react";
import { DashboardData } from "@/types/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import {
  Users,
  BookOpen,
  Compass,
  FileCheck2,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

interface ChartSectionProps {
  data: DashboardData;
}

const userGrowthConfig = {
  students: {
    label: "Siswa (Siswa + Guru)",
    color: "#2563eb", // blue-600
  },
  teachers: {
    label: "Guru / Fasilitator",
    color: "#9333ea", // purple-600
  },
} satisfies ChartConfig;

const learningActivityConfig = {
  classes: {
    label: "Kelas Baru",
    color: "#059669", // emerald-600
  },
  materials: {
    label: "Materi Ditambahkan",
    color: "#0284c7", // sky-600
  },
  quizAttempts: {
    label: "Kuis Dikerjakan",
    color: "#4f46e5", // indigo-600
  },
  assignments: {
    label: "Tugas Dikumpulkan",
    color: "#d97706", // amber-600
  },
} satisfies ChartConfig;

const workshopActivityConfig = {
  workshopRegistrations: {
    label: "Pendaftaran Peserta",
    color: "#e11d48", // rose-600
  },
  classes: {
    label: "Workshop / Kelas Baru",
    color: "#059669", // emerald-600
  },
} satisfies ChartConfig;

const evaluationConfig = {
  quizAttempts: {
    label: "Pengerjaan Kuis",
    color: "#6366f1", // indigo-500
  },
  assignments: {
    label: "Tugas Dikumpulkan",
    color: "#14b8a6", // teal-500
  },
} satisfies ChartConfig;

export function ChartSection({ data }: ChartSectionProps) {
  const [activeTab, setActiveTab] = useState("users");

  const timeline = data.timeline || [];
  const overview = data.overview;
  const workshopStats = data.workshopStats;
  const periodLabel = data.periodInfo?.label || "Periode Aktif";

  const totalUsers = overview?.totalUsers || {
    students: data.studentCount,
    teachers: data.teacherCount,
    admins: 1,
    total: data.studentCount + data.teacherCount + 1,
  };

  const studentPercent = totalUsers.total > 0
    ? Math.round((totalUsers.students / totalUsers.total) * 100)
    : 0;
  const teacherPercent = totalUsers.total > 0
    ? Math.round((totalUsers.teachers / totalUsers.total) * 100)
    : 0;
  const adminPercent = totalUsers.total > 0
    ? Math.max(0, 100 - studentPercent - teacherPercent)
    : 0;

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <Card className="rounded-3xl border shadow-xs">
        <CardHeader className="pb-2 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                Analitik & Visualisasi Aktivitas LMS
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-0.5">
                Pemantauan data perkembangan untuk periode: <span className="font-semibold text-foreground">{periodLabel}</span>
              </CardDescription>
            </div>

            <Badge variant="outline" className="w-fit text-xs px-2.5 py-1 bg-muted">
              {data.periodInfo?.granularity === "day" ? "Rincian Harian" : "Rincian Bulanan (Jan - Des)"}
            </Badge>
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-muted rounded-xl">
              <TabsTrigger value="users" className="gap-1.5 py-2 text-xs font-semibold">
                <Users className="h-3.5 w-3.5" />
                Pertumbuhan Pengguna
              </TabsTrigger>
              <TabsTrigger value="learning" className="gap-1.5 py-2 text-xs font-semibold">
                <BookOpen className="h-3.5 w-3.5" />
                Aktivitas Belajar
              </TabsTrigger>
              <TabsTrigger value="workshops" className="gap-1.5 py-2 text-xs font-semibold">
                <Compass className="h-3.5 w-3.5" />
                Analitik Workshop
              </TabsTrigger>
              <TabsTrigger value="evaluation" className="gap-1.5 py-2 text-xs font-semibold">
                <FileCheck2 className="h-3.5 w-3.5" />
                Evaluasi & Pengerjaan
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Pertumbuhan Pengguna */}
            <TabsContent value="users" className="pt-4 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
                {/* Area Chart: Siswa & Guru */}
                <div className="lg:col-span-3">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground">
                      Tren Pendaftaran Siswa & Guru
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
                        <span>Siswa (Siswa & Guru) ({overview?.students.current ?? 0})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#9333ea]" />
                        <span>Guru ({overview?.teachers.current ?? 0})</span>
                      </div>
                    </div>
                  </div>

                  <ChartContainer config={userGrowthConfig} className="aspect-auto h-[320px] w-full">
                    <AreaChart
                      data={timeline}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#9333ea" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={11}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        fontSize={11}
                        allowDecimals={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="students"
                        stroke="#2563eb"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorStudents)"
                        name="Siswa (Siswa & Guru)"
                      />
                      <Area
                        type="monotone"
                        dataKey="teachers"
                        stroke="#9333ea"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorTeachers)"
                        name="Guru Baru"
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>

                {/* Sidebar: Distribusi Role Pengguna */}
                <div className="lg:col-span-1 flex flex-col justify-between border rounded-2xl p-4 bg-muted/20 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      Komposisi Role Pengguna
                    </h4>
                    <div className="text-2xl font-extrabold text-foreground mb-1">
                      {totalUsers.total.toLocaleString("id-ID")}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total akun terdaftar di sistem Sekolah Alam
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Siswa */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-[#2563eb]" />
                          Siswa (Siswa & Guru) ({totalUsers.students})
                        </span>
                        <span>{studentPercent}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${studentPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Guru */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-[#9333ea]" />
                          Guru ({totalUsers.teachers})
                        </span>
                        <span>{teacherPercent}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${teacherPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Admin */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                          Admin ({totalUsers.admins})
                        </span>
                        <span>{adminPercent}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${adminPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t text-[11px] text-muted-foreground">
                    Perbandingan proporsi akun aktif siswa terhadap tenaga pendidik dan administrator.
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: Aktivitas Pembelajaran */}
            <TabsContent value="learning" className="pt-4 space-y-4">
              <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  Perkembangan Kelas, Materi Belajar, & Pengerjaan Kuis
                </h3>
                <p className="text-xs text-muted-foreground">
                  Statistik penambahan konten dan partisipasi belajar per periode
                </p>
              </div>

              <ChartContainer config={learningActivityConfig} className="aspect-auto h-[340px] w-full">
                <BarChart
                  data={timeline}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={11}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="classes"
                    fill="#059669"
                    radius={[4, 4, 0, 0]}
                    name="Kelas Baru"
                  />
                  <Bar
                    dataKey="materials"
                    fill="#0284c7"
                    radius={[4, 4, 0, 0]}
                    name="Materi Ditambahkan"
                  />
                  <Bar
                    dataKey="quizAttempts"
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                    name="Kuis Dikerjakan"
                  />
                  <Bar
                    dataKey="assignments"
                    fill="#d97706"
                    radius={[4, 4, 0, 0]}
                    name="Tugas Dikumpulkan"
                  />
                </BarChart>
              </ChartContainer>
            </TabsContent>

            {/* TAB 3: Analitik Workshop */}
            <TabsContent value="workshops" className="pt-4 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
                {/* Bar/Area Chart: Registrasi Workshop */}
                <div className="lg:col-span-3">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground">
                      Tren Pendaftaran Peserta Workshop
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      Total Pendaftar Periode Ini: {overview?.workshopRegistrations.current ?? 0}
                    </Badge>
                  </div>

                  <ChartContainer config={workshopActivityConfig} className="aspect-auto h-[320px] w-full">
                    <AreaChart
                      data={timeline}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorWsReg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e11d48" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={11}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        fontSize={11}
                        allowDecimals={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="workshopRegistrations"
                        stroke="#e11d48"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorWsReg)"
                        name="Pendaftaran Peserta"
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>

                {/* Sidebar: Status Approval Workshop & Peserta */}
                <div className="lg:col-span-1 flex flex-col justify-between border rounded-2xl p-4 bg-muted/20 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      Status Persetujuan Program
                    </h4>
                    <div className="text-2xl font-extrabold text-foreground mb-1">
                      {workshopStats?.total || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total workshop terdaftar dalam sistem
                    </p>
                  </div>

                  {/* Status Workshop */}
                  <div className="space-y-2 border-t pt-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Status Workshop
                    </span>
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Disetujui
                      </span>
                      <span className="font-bold">{workshopStats?.approved || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                        <Clock className="h-3.5 w-3.5" /> Menunggu
                      </span>
                      <span className="font-bold">{workshopStats?.pending || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                        <XCircle className="h-3.5 w-3.5" /> Ditolak
                      </span>
                      <span className="font-bold">{workshopStats?.rejected || 0}</span>
                    </div>
                  </div>

                  {/* Status Peserta */}
                  <div className="space-y-2 border-t pt-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Status Peserta ({workshopStats?.participantsTotal || 0})
                    </span>
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-emerald-600 dark:text-emerald-400">Diterima</span>
                      <span className="font-bold">{workshopStats?.participantsApproved || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-amber-600 dark:text-amber-400">Menunggu</span>
                      <span className="font-bold">{workshopStats?.participantsPending || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-rose-600 dark:text-rose-400">Ditolak</span>
                      <span className="font-bold">{workshopStats?.participantsRejected || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: Evaluasi Pembelajaran */}
            <TabsContent value="evaluation" className="pt-4 space-y-4">
              <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Aktivitas Evaluasi: Pengerjaan Kuis & Pengumpulan Tugas
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Perbandingan intensitas latihan kuis dan tugas siswa sepanjang periode
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs gap-1 border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
                    Rata-rata Skor Kuis: {overview?.averageQuizScore.current || 0} / 100
                  </Badge>
                </div>
              </div>

              <ChartContainer config={evaluationConfig} className="aspect-auto h-[320px] w-full">
                <BarChart
                  data={timeline}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={11}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="quizAttempts"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    name="Pengerjaan Kuis"
                  />
                  <Bar
                    dataKey="assignments"
                    fill="#14b8a6"
                    radius={[4, 4, 0, 0]}
                    name="Tugas Dikumpulkan"
                  />
                </BarChart>
              </ChartContainer>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
}
