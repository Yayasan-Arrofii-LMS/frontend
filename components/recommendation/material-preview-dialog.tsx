"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RecommendedMaterial,
  FeedbackType,
  InteractionStatus,
} from "@/types/recommendation";
import {
  Clock,
  BookOpen,
  Video,
  FileText,
  Sparkles,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Meh,
  GraduationCap,
  Trees,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface MaterialPreviewDialogProps {
  material: RecommendedMaterial | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFeedback?: FeedbackType;
  currentStatus?: InteractionStatus;
  onFeedbackChange: (materialId: string, feedback: FeedbackType) => void;
  onMarkCompleted: (materialId: string) => void;
  onNavigateToMaterial?: (material: RecommendedMaterial) => void;
}

export function MaterialPreviewDialog({
  material,
  open,
  onOpenChange,
  currentFeedback,
  currentStatus,
  onFeedbackChange,
  onMarkCompleted,
  onNavigateToMaterial,
}: MaterialPreviewDialogProps) {
  const router = useRouter();

  if (!material) return null;

  const isCompleted = currentStatus === "Selesai" || currentStatus === "Dipelajari";

  const handleLearnMaterial = () => {
    onMarkCompleted(material.id);
    onOpenChange(false);

    if (onNavigateToMaterial) {
      onNavigateToMaterial(material);
      return;
    }

    const targetMaterialId =
      material.materialNumericId ||
      parseInt(
        material.id
          .replace("rec-", "")
          .replace("rem-", "")
          .replace("adv-", "")
          .replace("hist-", "")
      );

    if (material.classId && !isNaN(targetMaterialId)) {
      router.push(
        `/classes/${material.classId}/materials/${targetMaterialId}?from=my-classes`
      );
    } else {
      toast.info(`Membuka pembelajaran untuk ${material.title}`);
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "Video":
        return <Video className="h-4 w-4" />;
      case "Artikel":
        return <FileText className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="outline" className="border-emerald-300 text-emerald-800 dark:text-emerald-400">
              {material.category}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              {getMediaIcon(material.mediaType)}
              <span>{material.mediaType}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              <span>{material.durationMinutes} menit</span>
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {material.difficulty}
            </Badge>
            {isCompleted && (
              <Badge className="bg-emerald-600 text-white flex items-center gap-1 text-xs">
                <CheckCircle2 className="h-3 w-3" />
                Sudah Dipelajari
              </Badge>
            )}
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold leading-snug">
            {material.title}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {material.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Thumbnail Preview */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-muted border">
            <Image
              src={material.thumbnail}
              alt={material.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
              <p className="text-white text-xs sm:text-sm font-medium flex items-center gap-1.5">
                <Trees className="h-4 w-4 text-emerald-400" />
                Eksplorasi Kurikulum Alam Bebas Sekolah Alam
              </p>
            </div>
          </div>

          {/* Ringkasan Materi */}
          {material.contentPreview && (
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/30 p-3.5 space-y-1.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                  Ringkasan Materi
                </h4>
                <p className="text-sm leading-relaxed text-foreground">
                  {material.contentPreview.summary}
                </p>
              </div>

              {/* Poin Utama */}
              <div className="rounded-lg border p-3.5 space-y-2 bg-card">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  Kompetensi Inti yang Dipelajari
                </h4>
                <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                  {material.contentPreview.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Latihan Praktik Lapangan */}
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 space-y-1">
                <h4 className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-emerald-600" />
                  Tugas Praktik Lapangan (Action Learning)
                </h4>
                <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-400 leading-relaxed">
                  {material.contentPreview.practicalExercise}
                </p>
              </div>
            </div>
          )}

          {/* Feedback Section */}
          <div className="pt-2 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs">
              <p className="font-semibold text-foreground">Apakah materi ini bermanfaat untukmu?</p>
              <p className="text-muted-foreground">Masukanmu membantu akurasi rekomendasi berikutnya.</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant={currentFeedback === "Relevan" ? "default" : "outline"}
                size="sm"
                className={`h-8 text-xs gap-1 ${currentFeedback === "Relevan"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : ""
                  }`}
                onClick={() => onFeedbackChange(material.id, "Relevan")}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                Relevan
              </Button>
              <Button
                type="button"
                variant={currentFeedback === "Kurang relevan" ? "default" : "outline"}
                size="sm"
                className={`h-8 text-xs gap-1 ${currentFeedback === "Kurang relevan"
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : ""
                  }`}
                onClick={() => onFeedbackChange(material.id, "Kurang relevan")}
              >
                <Meh className="h-3.5 w-3.5" />
                Kurang
              </Button>
              <Button
                type="button"
                variant={currentFeedback === "Tidak tertarik" ? "default" : "outline"}
                size="sm"
                className={`h-8 text-xs gap-1 ${currentFeedback === "Tidak tertarik"
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : ""
                  }`}
                onClick={() => onFeedbackChange(material.id, "Tidak tertarik")}
              >
                <ThumbsDown className="h-3.5 w-3.5" />
                Tidak Tertarik
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
          {!isCompleted ? (
            <Button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              onClick={handleLearnMaterial}
            >
              <CheckCircle2 className="h-4 w-4" />
              Pelajari Materi
            </Button>
          ) : (
            <Button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              onClick={handleLearnMaterial}
            >
              <BookOpen className="h-4 w-4" />
              Buka Materi Kelas
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
