"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchClassDetail } from "@/lib/api/sections";
import { Material } from "@/types/section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Award, FileDown, Eye, Download } from "lucide-react";
import { toast } from "sonner";
import { extractYouTubeVideoId, getYouTubeEmbedUrl } from "@/lib/utils/youtube";

interface ViewMaterialPageProps {
  classId: string;
  materialId: string;
  basePath: string;
}

export function ViewMaterialPage({
  classId,
  materialId,
  basePath,
}: ViewMaterialPageProps) {
  const router = useRouter();
  const [material, setMaterial] = useState<Material | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMaterialData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch class detail to get material with sectionId
        const classData = await fetchClassDetail(classId);
        
        // Find the material in sections
        let foundMaterial: Material | null = null;
        for (const section of classData.sections) {
          const mat = section.Material.find((m) => m.id === parseInt(materialId));
          if (mat) {
            foundMaterial = mat;
            break;
          }
        }

        if (foundMaterial) {
          setMaterial(foundMaterial);
        } else {
          toast.error("Materi tidak ditemukan");
          router.push(`${basePath}/${classId}`);
        }
      } catch (error) {
        console.error("Failed to fetch material:", error);
        toast.error("Gagal memuat materi");
        router.push(`${basePath}/${classId}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterialData();
  }, [classId, materialId, router, basePath]);

  const handleBack = () => {
    router.push(`${basePath}/${classId}`);
  };

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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-4">
        <Skeleton className="h-10 sm:h-12 w-3/4" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-48 sm:h-64 w-full" />
      </div>
    );
  }

  if (!material) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      {/* Back Button */}
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
      </div>

      <article className="prose prose-slate dark:prose-invert max-w-none">
        <h1 className="text-2xl sm:text-4xl font-bold mb-4">
          {material.title}
        </h1>

        {material.xp && material.xp > 0 && (
          <div className="flex items-center gap-2 mb-6 not-prose">
            <Badge variant="secondary" className="text-base">
              <Award className="h-4 w-4 mr-1" />
              +{material.xp} XP
            </Badge>
          </div>
        )}

        <Separator className="my-6" />

        <div 
          className="leading-relaxed"
          dangerouslySetInnerHTML={{ __html: material.content }}
        />

        {material.video_link && (
          <>
            <Separator className="my-8" />
            <div className="not-prose">
              <h3 className="text-xl font-semibold mb-4">Video Pembelajaran</h3>
              {(() => {
                const videoId = extractYouTubeVideoId(material.video_link);
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
                        Link video: {material.video_link}
                      </p>
                    </div>
                  );
                }
              })()}
            </div>
          </>
        )}

        {material.Material_File && material.Material_File.length > 0 && (
          <>
            <Separator className="my-8" />
            <div>
              <h3 className="text-xl font-semibold mb-4">File Lampiran</h3>
              <div className="space-y-3">
                {material.Material_File.map((file) => (
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
          </>
        )}
      </article>
    </div>
  );
}
