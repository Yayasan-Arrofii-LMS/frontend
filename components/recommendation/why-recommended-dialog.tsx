"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { RecommendedMaterial } from "@/types/recommendation";
import { Sparkles, Target, Compass, Award, CheckCircle2 } from "lucide-react";

interface WhyRecommendedDialogProps {
  material: RecommendedMaterial | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WhyRecommendedDialog({
  material,
  open,
  onOpenChange,
}: WhyRecommendedDialogProps) {
  if (!material) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
              {material.recommendationType}
            </Badge>
            <Badge variant="secondary">{material.category}</Badge>
          </div>
          <DialogTitle className="text-xl font-bold leading-tight">
            Mengapa Materi Ini Direkomendasikan?
          </DialogTitle>
          <DialogDescription className="text-sm pt-1">
            Transparansi sistem rekomendasi cerdas LMS Sekolah Alam untuk materi{" "}
            <span className="font-semibold text-foreground">"{material.title}"</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Ringkasan Analisis */}
          <div className="rounded-lg border bg-muted/40 p-3.5 space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Dasar Rekomendasi
            </h4>
            <p className="text-sm text-foreground leading-relaxed">
              {material.detailedReason.overview}
            </p>
          </div>

          {/* Rincian Parameter */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3 bg-card space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <Target className="h-3.5 w-3.5" />
                Target Kompetensi
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {material.detailedReason.targetCompetency}
              </p>
            </div>

            <div className="rounded-lg border p-3 bg-card space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <Compass className="h-3.5 w-3.5" />
                Jalur Pembelajaran
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {material.detailedReason.learningPathMatch}
              </p>
            </div>
          </div>

          {/* Skor Relevansi */}
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 flex items-start gap-3">
            <Award className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                Tingkat Kecocokan & Relevansi
              </p>
              <p className="text-emerald-700/90 dark:text-emerald-400 leading-relaxed">
                {material.detailedReason.interestRelevance}
              </p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1 border-t">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Kamu dapat memberikan umpan balik (feedback) pada card untuk meningkatkan akurasi rekomendasi berikutnya.</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
