"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RemedialItem, RecommendedMaterial } from "@/types/recommendation";
import {
  AlertTriangle,
  RotateCcw,
  Target,
  Clock,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface RemedialSectionProps {
  remedialData: RemedialItem;
  material: RecommendedMaterial | undefined;
  onViewMaterial: (material: RecommendedMaterial) => void;
}

export function RemedialSection({
  remedialData,
  material,
  onViewMaterial,
}: RemedialSectionProps) {
  const isPassing = remedialData.currentScore >= remedialData.targetScore;

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-3">
        <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Perkuat Pemahamanmu
          </h2>
          <p className="text-xs text-muted-foreground">
            Rekomendasi remedial terarah untuk memantapkan kompetensi yang belum mencapai target kelulusan
          </p>
        </div>
      </div>

      <Card className="border-2 border-amber-300/80 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/40 via-card to-emerald-50/20 dark:from-amber-950/20 dark:via-card dark:to-emerald-950/10 shadow-sm overflow-hidden">
        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Sisi Kiri: Status Kompetensi & Skor */}
            <div className="lg:col-span-5 space-y-4 lg:border-r lg:pr-6 border-border/60">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-amber-400 bg-amber-100/70 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-semibold text-xs"
                >
                  Prioritas Remedial
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {remedialData.category}
                </Badge>
              </div>

              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Target Kompetensi
                </span>
                <h3 className="text-lg font-bold text-foreground mt-0.5">
                  {remedialData.competency}
                </h3>
              </div>

              {/* Progress bar komparasi skor */}
              <div className="space-y-2 bg-background/80 dark:bg-card/80 p-3.5 rounded-xl border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium flex items-center gap-1">
                    <Target className="h-3.5 w-3.5 text-amber-600" />
                    Hasil Evaluasi Simulasi
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                      {remedialData.currentScore}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / {remedialData.targetScore} (Target)
                    </span>
                  </div>
                </div>

                <div className="relative pt-1">
                  <Progress
                    value={(remedialData.currentScore / 100) * 100}
                    className="h-2.5 bg-muted"
                  />
                  {/* Marker target */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-emerald-600 dark:bg-emerald-400 z-10"
                    style={{ left: `${remedialData.targetScore}%` }}
                    title={`Target Ketuntasan: ${remedialData.targetScore}`}
                  />
                </div>

                <p className="text-[11px] text-muted-foreground pt-1 flex items-center justify-between">
                  <span>Skor saat ini: {remedialData.currentScore}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    Target kelulusan: {remedialData.targetScore}
                  </span>
                </p>
              </div>

              <p className="text-xs text-muted-foreground italic">
                *Data evaluasi simulasi diolah dari rekam jejak latihan kuis siswa.
              </p>
            </div>

            {/* Sisi Kanan: Materi Remedial yang Direkomendasikan */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <span>Materi Pembelajaran Penguatan</span>
                </div>
                <h4 className="text-lg font-bold text-foreground">
                  {remedialData.materialTitle}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {remedialData.description}
                </p>
              </div>

              {/* Box Alasan */}
              <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-3 text-xs space-y-1">
                <span className="font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                  Mengapa materi ini penting?
                </span>
                <p className="text-amber-800 dark:text-amber-400/90 leading-relaxed">
                  {remedialData.reason}
                </p>
              </div>

              {/* Info & Action Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    {remedialData.durationMinutes} menit
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium">
                    <BookOpen className="h-3.5 w-3.5" />
                    {remedialData.mediaType}
                  </span>
                </div>

                {material && (
                  <Button
                    type="button"
                    onClick={() => onViewMaterial(material)}
                    className="bg-amber-600 hover:bg-amber-700 text-white gap-2 text-xs h-9 font-medium shadow-sm w-full sm:w-auto"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>{remedialData.actionText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
