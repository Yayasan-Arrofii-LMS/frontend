"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  RecommendedMaterial,
  FeedbackType,
  InteractionStatus,
} from "@/types/recommendation";
import {
  Clock,
  Video,
  FileText,
  BookOpen,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Meh,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface MaterialCardProps {
  material: RecommendedMaterial;
  currentFeedback?: FeedbackType;
  currentStatus?: InteractionStatus;
  onWhyClick: (material: RecommendedMaterial) => void;
  onViewMaterial: (material: RecommendedMaterial) => void;
  onFeedbackChange: (materialId: string, feedback: FeedbackType) => void;
}

export function MaterialCard({
  material,
  currentFeedback,
  currentStatus,
  onWhyClick,
  onViewMaterial,
  onFeedbackChange,
}: MaterialCardProps) {
  const isCompleted =
    currentStatus === "Selesai" || currentStatus === "Dipelajari";

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "Video":
        return <Video className="h-3.5 w-3.5" />;
      case "Artikel":
        return <FileText className="h-3.5 w-3.5" />;
      default:
        return <BookOpen className="h-3.5 w-3.5" />;
    }
  };

  const getRecommendationTypeBadge = (type: string) => {
    switch (type) {
      case "Berdasarkan Minat":
        return (
          <Badge
            variant="outline"
            className="border-emerald-400 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700 text-[11px] font-medium"
          >
            Berdasarkan Minat
          </Badge>
        );
      case "Berdasarkan Progres":
        return (
          <Badge
            variant="outline"
            className="border-blue-400 bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700 text-[11px] font-medium"
          >
            Berdasarkan Progres
          </Badge>
        );
      case "Remedial":
        return (
          <Badge
            variant="outline"
            className="border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700 text-[11px] font-medium"
          >
            Remedial
          </Badge>
        );
      case "Materi Lanjutan":
        return (
          <Badge
            variant="outline"
            className="border-purple-400 bg-purple-50 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-700 text-[11px] font-medium"
          >
            Materi Lanjutan
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-[11px]">
            {type}
          </Badge>
        );
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden border-border/80 hover:shadow-lg transition-all duration-200 group bg-card">
      {/* Thumbnail 16:9 */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <Image
          src={material.thumbnail}
          alt={material.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <Badge
            variant="secondary"
            className="bg-background/90 backdrop-blur text-foreground text-[11px] flex items-center gap-1 shadow-sm"
          >
            {getMediaIcon(material.mediaType)}
            <span>{material.mediaType}</span>
          </Badge>
        </div>

        <div className="absolute top-2.5 right-2.5 z-10">
          {getRecommendationTypeBadge(material.recommendationType)}
        </div>

        {/* Bottom Time & Difficulty Bar */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 flex items-center justify-between text-white text-xs">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="h-3 w-3" />
            {material.durationMinutes} menit
          </span>
          <span className="bg-white/20 backdrop-blur px-2 py-0.5 rounded text-[10px] font-semibold">
            {material.difficulty}
          </span>
        </div>
      </div>

      <CardHeader className="p-4 pb-2 space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider text-[11px]">
            {material.category}
          </span>
          {isCompleted && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Tuntas
            </span>
          )}
        </div>

        <h3 className="text-base font-bold text-foreground line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
          {material.title}
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {material.description}
        </p>

        {/* Progress Bar jika ada */}
        {material.progressPercentage !== undefined && material.progressPercentage > 0 && (
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Progres Belajar</span>
              <span className="font-semibold">{material.progressPercentage}%</span>
            </div>
            <Progress value={material.progressPercentage} className="h-1.5" />
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 pt-1 flex-1 flex flex-col justify-end space-y-3">
        {/* Alasan Rekomendasi Section */}
        <div className="rounded-lg bg-muted/50 p-2.5 border border-border/50 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground flex items-center gap-1 text-[11px]">
              Alasan Rekomendasi
            </span>
            <button
              type="button"
              onClick={() => onWhyClick(material)}
              className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5 font-medium"
            >
              <HelpCircle className="h-3 w-3" />
              Mengapa?
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
            {material.reason}
          </p>
        </div>

        {/* Feedback Section */}
        <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
          <span className="text-muted-foreground">Apakah relevan?</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Relevan"
              onClick={() => onFeedbackChange(material.id, "Relevan")}
              className={`p-1.5 rounded-md transition-colors ${currentFeedback === "Relevan"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold ring-1 ring-emerald-500/50"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Kurang relevan"
              onClick={() => onFeedbackChange(material.id, "Kurang relevan")}
              className={`p-1.5 rounded-md transition-colors ${currentFeedback === "Kurang relevan"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold ring-1 ring-amber-500/50"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              <Meh className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Tidak tertarik"
              onClick={() => onFeedbackChange(material.id, "Tidak tertarik")}
              className={`p-1.5 rounded-md transition-colors ${currentFeedback === "Tidak tertarik"
                ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold ring-1 ring-rose-500/50"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          type="button"
          onClick={() => onViewMaterial(material)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs h-9 font-medium shadow-sm"
        >
          <span>Lihat Materi</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
