"use client";

import { useState, useEffect } from "react";
import { Material } from "@/types/section";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/optimized-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, FileDown, Eye, Download } from "lucide-react";
import { toast } from "sonner";
import { extractYouTubeVideoId, getYouTubeEmbedUrl } from "@/lib/utils/youtube";
import { getMaterial } from "@/lib/api/sections";

interface ViewMaterialModalProps {
  material: Material | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewMaterialModal({
  material,
  open,
  onOpenChange,
}: ViewMaterialModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedMaterial, setFetchedMaterial] = useState<Material | null>(null);

  // Fetch complete material data when modal opens
  useEffect(() => {
    if (!open || !material) {
      setFetchedMaterial(null);
      return;
    }

    const fetchMaterialData = async () => {
      try {
        setIsLoading(true);
        const data = await getMaterial(material.sectionId, material.id);
        setFetchedMaterial(data);
      } catch (error) {
        console.error("Failed to fetch material:", error);
        toast.error("Gagal memuat materi");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterialData();
  }, [open, material]);

  const handleDownloadFile = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Gagal mengunduh file");
    }
  };

  const displayMaterial = fetchedMaterial || material;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isLoading ? "Memuat..." : displayMaterial?.title || "Materi"}
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : displayMaterial ? (
          <>
            {displayMaterial.xp && displayMaterial.xp > 0 && (
              <div className="flex items-center gap-2 -mt-2">
                <Badge variant="secondary" className="text-base">
                  <Award className="h-4 w-4 mr-1" />
                  +{displayMaterial.xp} XP
                </Badge>
              </div>
            )}

            <Separator className="my-4" />

            <div className="space-y-6">
              {/* Content */}
              <div
                className="prose prose-slate dark:prose-invert max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{ __html: displayMaterial.content }}
              />

              {/* Video */}
              {displayMaterial.video_link && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Video Pembelajaran</h3>
                  {(() => {
                    const videoId = extractYouTubeVideoId(displayMaterial.video_link);
                    if (videoId) {
                      return (
                        <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
                          <iframe
                            width="100%"
                            height="100%"
                            src={getYouTubeEmbedUrl(videoId)}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="border-0"
                          />
                        </div>
                      );
                    } else {
                      return (
                        <div className="p-4 border rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground">
                            Link video: {displayMaterial.video_link}
                          </p>
                        </div>
                      );
                    }
                  })()}
                </div>
              )}

              {/* Files */}
              {displayMaterial.Material_File && displayMaterial.Material_File.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">File Lampiran</h3>
                  <div className="space-y-3">
                    {displayMaterial.Material_File.map((file) => (
                      <div
                        key={file.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4 border rounded-lg"
                      >
                        <FileDown className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">
                            {file.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Klik untuk melihat atau mengunduh
                          </p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(file.url, "_blank")}
                            className="flex-1 sm:flex-none"
                          >
                            <Eye className="h-4 w-4 sm:mr-2" />
                            <span className="sm:inline">Preview</span>
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDownloadFile(file.url, file.title)}
                            className="flex-1 sm:flex-none"
                          >
                            <Download className="h-4 w-4 sm:mr-2" />
                            <span className="sm:inline">Download</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
