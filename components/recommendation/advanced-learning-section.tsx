"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AdvancedLearningItem,
  RecommendedMaterial,
} from "@/types/recommendation";
import {
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Clock,
  Lock,
  Unlock,
  Award,
} from "lucide-react";

interface AdvancedLearningSectionProps {
  advancedData: AdvancedLearningItem;
  material: RecommendedMaterial | undefined;
  onViewMaterial: (material: RecommendedMaterial) => void;
}

export function AdvancedLearningSection({
  advancedData,
  material,
  onViewMaterial,
}: AdvancedLearningSectionProps) {
  const isAvailable = advancedData.accessStatus !== "Terkunci";

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Lanjutkan Perjalanan Belajarmu
          </h2>
          <p className="text-xs text-muted-foreground">
            Jalur pembelajaran lanjutan setelah kamu menuntaskan kompetensi prasyarat sebelumnya
          </p>
        </div>
      </div>

      <Card className="border border-purple-200/80 dark:border-purple-900/50 bg-gradient-to-r from-purple-50/30 via-card to-emerald-50/20 dark:from-purple-950/20 dark:via-card dark:to-emerald-950/10 shadow-sm overflow-hidden">
        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Step 1: Capaian Sebelumnya */}
            <div className="md:col-span-5 space-y-3 p-4 rounded-xl bg-background/80 dark:bg-muted/30 border">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Materi Tuntas
                </span>
                <Badge variant="secondary" className="text-[11px]">
                  Prasyarat Terpenuhi
                </Badge>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Materi Sebelumnya:</p>
                <h4 className="text-sm font-bold text-foreground">
                  {advancedData.previousMaterial}
                </h4>
              </div>

              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-2.5 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-2">
                <Award className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                    Kompetensi Tercapai:
                  </span>
                  <p className="text-emerald-800 dark:text-emerald-400 mt-0.5">
                    {advancedData.competencyAchieved}
                  </p>
                </div>
              </div>
            </div>

            {/* Separator / Arrow */}
            <div className="hidden md:flex md:col-span-1 justify-center">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            {/* Step 2: Rekomendasi Materi Lanjutan */}
            <div className="md:col-span-6 space-y-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-purple-400 bg-purple-100/70 text-purple-900 dark:bg-purple-950 dark:text-purple-300 font-semibold text-xs"
                >
                  Materi Lanjutan Terbuka
                </Badge>
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 text-xs"
                >
                  {isAvailable ? (
                    <>
                      <Unlock className="h-3 w-3 text-emerald-600" />
                      <span>{advancedData.accessStatus}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 text-rose-600" />
                      <span>Terkunci</span>
                    </>
                  )}
                </Badge>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-bold text-foreground">
                  {advancedData.nextMaterialTitle}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                  {advancedData.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  {advancedData.durationMinutes} menit
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium">
                  <BookOpen className="h-3.5 w-3.5" />
                  {advancedData.mediaType}
                </span>
                <span>•</span>
                <span className="text-purple-700 dark:text-purple-400 font-medium">
                  {advancedData.category}
                </span>
              </div>

              <div className="pt-2">
                {material && isAvailable ? (
                  <Button
                    type="button"
                    onClick={() => onViewMaterial(material)}
                    className="bg-purple-600 hover:bg-purple-700 text-white gap-2 text-xs h-9 font-medium shadow-sm w-full sm:w-auto"
                  >
                    <span>Mulai Belajar</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled
                    variant="outline"
                    className="text-xs h-9 gap-1.5"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Prasyarat Belum Terpenuhi</span>
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
