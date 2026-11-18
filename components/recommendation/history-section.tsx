"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  RecommendationHistoryItem,
  RecommendedMaterial,
  RecommendationType,
} from "@/types/recommendation";
import {
  History,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  Meh,
  CheckCircle2,
  BookOpen,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface HistorySectionProps {
  historyItems: RecommendationHistoryItem[];
  allMaterials: RecommendedMaterial[];
  onViewMaterial: (material: RecommendedMaterial) => void;
}

export function HistorySection({
  historyItems,
  allMaterials,
  onViewMaterial,
}: HistorySectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("Semua");

  const filterTypes: Array<"Semua" | RecommendationType> = [
    "Semua",
    "Berdasarkan Minat",
    "Berdasarkan Progres",
    "Remedial",
    "Materi Lanjutan",
  ];

  const filteredHistory = historyItems.filter((item) => {
    const matchesSearch =
      item.materialTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedTypeFilter === "Semua" ||
      item.recommendationType === selectedTypeFilter;

    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Selesai":
        return (
          <Badge className="bg-emerald-600 text-white text-[10px] gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Selesai
          </Badge>
        );
      case "Dipelajari":
        return (
          <Badge
            variant="outline"
            className="border-teal-400 bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300 text-[10px] gap-1"
          >
            <BookOpen className="h-3 w-3" />
            Dipelajari
          </Badge>
        );
      case "Dibuka":
        return (
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Clock className="h-3 w-3" />
            Dibuka
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] text-muted-foreground">
            Belum Dibuka
          </Badge>
        );
    }
  };

  const getFeedbackBadge = (feedback?: string) => {
    if (!feedback) return null;
    switch (feedback) {
      case "Relevan":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
            <ThumbsUp className="h-3 w-3" />
            Relevan
          </span>
        );
      case "Kurang relevan":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
            <Meh className="h-3 w-3" />
            Kurang Relevan
          </span>
        );
      case "Tidak tertarik":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400">
            <ThumbsDown className="h-3 w-3" />
            Tidak Tertarik
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="mb-12 border-border/80 shadow-sm overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-4 sm:p-5 flex items-center justify-between border-b bg-muted/20">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              <History className="h-4 w-4" />
            </span>
            <div>
              <CardTitle className="text-lg font-bold text-foreground">
                Riwayat Rekomendasi
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Daftar histori rekomendasi materi yang pernah disajikan beserta catatan feedbackmu
              </p>
            </div>
          </div>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <CardContent className="p-4 sm:p-6 space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari materi atau alasan rekomendasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              {/* Filter Tabs/Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs text-muted-foreground font-medium hidden md:inline shrink-0 flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  Jenis:
                </span>
                {filterTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedTypeFilter(type)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${selectedTypeFilter === type
                        ? "bg-emerald-600 text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Riwayat List / Table */}
            {filteredHistory.length === 0 ? (
              <div className="py-12 text-center border rounded-xl bg-muted/10 space-y-2">
                <Sparkles className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">
                  Tidak Ada Riwayat yang Sesuai
                </p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Cobalah sesuaikan kata kunci pencarian atau ubah filter jenis rekomendasi.
                </p>
                {searchQuery && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 mt-2"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedTypeFilter("Semua");
                    }}
                  >
                    Reset Filter
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y border rounded-xl overflow-hidden bg-card">
                {filteredHistory.map((item) => {
                  const found = allMaterials.find(
                    (m) =>
                      m.id === item.materialId ||
                      (item.materialNumericId &&
                        m.materialNumericId === item.materialNumericId)
                  );

                  const correspondingMaterial: RecommendedMaterial = found
                    ? {
                        ...found,
                        classId: found.classId || item.classId,
                        sectionId: found.sectionId || item.sectionId,
                      }
                    : {
                        id: item.materialId,
                        materialNumericId: item.materialNumericId,
                        classId: item.classId,
                        sectionId: item.sectionId,
                        title: item.materialTitle,
                        category: "Sains Alam",
                        mediaType: "Materi Pembelajaran",
                        durationMinutes: 10,
                        description: item.reason,
                        difficulty: "Pemula",
                        thumbnail:
                          "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
                        recommendationType: item.recommendationType,
                        reason: item.reason,
                        detailedReason: {
                          overview: item.reason,
                          targetCompetency: item.materialTitle,
                          learningPathMatch: "Riwayat Rekomendasi Terpilih",
                          interestRelevance: "Rekomendasi Sebelumnya",
                        },
                        contentPreview: {
                          summary: item.reason,
                          keyPoints: [item.materialTitle],
                          practicalExercise: `Pelajari kembali materi "${item.materialTitle}" dari riwayat belajarmu.`,
                        },
                      };

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 sm:p-4 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-muted-foreground font-medium">
                            {item.date}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-normal"
                          >
                            {item.recommendationType}
                          </Badge>
                          {getStatusBadge(item.interactionStatus)}
                          {getFeedbackBadge(item.feedback)}
                        </div>

                        <h4 className="text-sm font-bold text-foreground">
                          {item.materialTitle}
                        </h4>

                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {item.reason}
                        </p>
                      </div>

                      <div className="shrink-0 self-end sm:self-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1.5 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950 dark:hover:text-emerald-300"
                          onClick={() => onViewMaterial(correspondingMaterial)}
                        >
                          <span>Buka Materi</span>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
