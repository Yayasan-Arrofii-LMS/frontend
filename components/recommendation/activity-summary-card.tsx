"use client";

import { Card, CardContent } from "@/components/ui/card";
import { RecommendationActivityStats } from "@/types/recommendation";
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  ThumbsUp,
  TrendingUp,
} from "lucide-react";

interface ActivitySummaryCardProps {
  stats: RecommendationActivityStats;
}

export function ActivitySummaryCard({ stats }: ActivitySummaryCardProps) {
  const completionRate =
    stats.totalRecommended > 0
      ? Math.round((stats.completedCount / stats.totalRecommended) * 100)
      : 0;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Aktivitas Rekomendasimu
            </h2>
            <p className="text-xs text-muted-foreground">
              Ringkasan interaksi dan progres eksplorasi materi personalisasi belajarmu
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Rekomendasi adaptif aktif</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metrik 1: Total Rekomendasi */}
        <Card className="border-border/60 hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {stats.totalRecommended}
              </p>
              <p className="text-xs text-muted-foreground truncate font-medium">
                Materi Direkomendasikan
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Metrik 2: Materi Dibuka */}
        <Card className="border-border/60 hover:border-blue-300 dark:hover:border-blue-800 transition-colors shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {stats.openedCount}
              </p>
              <p className="text-xs text-muted-foreground truncate font-medium">
                Materi Telah Dibuka
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Metrik 3: Materi Dipelajari / Selesai */}
        <Card className="border-border/60 hover:border-teal-300 dark:hover:border-teal-800 transition-colors shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {stats.completedCount}
                </p>
                <span className="text-xs text-teal-700 dark:text-teal-400 font-semibold">
                  ({completionRate}%)
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate font-medium">
                Materi Dituntaskan
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Metrik 4: Feedback Diberikan */}
        <Card className="border-border/60 hover:border-amber-300 dark:hover:border-amber-800 transition-colors shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0">
              <ThumbsUp className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {stats.feedbackCount}
              </p>
              <p className="text-xs text-muted-foreground truncate font-medium">
                Feedback Diberikan
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
