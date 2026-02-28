"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Award, FileDown, Eye, Download, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchStudentClassDetail } from "@/lib/api/classes";
import {
  fetchSectionMaterials,
  fetchStudentMaterialFiles,
  StudentMaterial,
  StudentMaterialFile,
} from "@/lib/api/student-materials";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { extractYouTubeVideoId, getYouTubeEmbedUrl } from "@/lib/utils/youtube";

interface ContentItem {
  id: number;
  type: "material" | "quiz";
  sectionId: number;
}

export default function MaterialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  const materialId = parseInt(params.materialId as string);

  const [currentMaterial, setCurrentMaterial] =
    useState<StudentMaterial | null>(null);
  const [materialFiles, setMaterialFiles] = useState<StudentMaterialFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const handlePreviewFile = async (fileUrl: string, fileName: string) => {
    try {
      console.log("Re-fetching material files to get fresh token...");

      // Fetch fresh files with new tokens
      const files = await fetchStudentMaterialFiles(materialId);
      const freshFile = files.find((f) => f.title === fileName);
      
      if (!freshFile) {
        throw new Error("File not found");
      }

      console.log("Opening preview in new tab:", freshFile.url);
      window.open(freshFile.url, "_blank");
    } catch (error) {
      console.error("Error opening preview:", error);
      toast.error("Gagal membuka preview");
    }
  };

  const handleDownloadFile = async (fileUrl: string, fileName: string) => {
    try {
      // Refresh the URL to get a new token by re-fetching the material files
      console.log("Re-fetching material files to get fresh token...");

      // Fetch fresh files with new tokens
      const files = await fetchStudentMaterialFiles(materialId);
      const freshFile = files.find((f) => f.title === fileName);
      
      if (!freshFile) {
        throw new Error("File not found");
      }

      console.log("Fresh file data:", freshFile);
      console.log("Downloading file from fresh URL:", freshFile.url);

      // Don't add Authorization header - the JWT token is already in the URL
      const response = await fetch(freshFile.url);
      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Download error:", errorText);
        throw new Error(`Failed to download file: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = freshFile.title || fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Gagal mengunduh file");
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        const classData = await fetchStudentClassDetail(classId);

        // Build content items list (all materials and quizzes in order)
        const items: ContentItem[] = [];
        classData.sections.forEach((section) => {
          section.materials.forEach((material) => {
            items.push({ id: material.id, type: "material", sectionId: section.id });
          });
          section.quizzes.forEach((quiz) => {
            items.push({ id: quiz.id, type: "quiz", sectionId: section.id });
          });
        });
        setContentItems(items);

        // Find current item index
        const index = items.findIndex(
          (item) => item.type === "material" && item.id === materialId
        );
        setCurrentIndex(index);

        let currentSectionId: number | null = null;
        for (const section of classData.sections) {
          const material = section.materials.find((m) => m.id === materialId);
          if (material) {
            currentSectionId = section.id;
            break;
          }
        }

        if (currentSectionId) {
          const materials = await fetchSectionMaterials(currentSectionId);
          const material = materials.find((m) => m.id === materialId);
          if (material) {
            setCurrentMaterial(material);
            
            // Fetch material files separately from student endpoint
            try {
              const files = await fetchStudentMaterialFiles(materialId);
              setMaterialFiles(files);
            } catch (fileError) {
              console.error("Failed to load material files:", fileError);
              // Don't fail the whole page if files fail to load
              setMaterialFiles([]);
            }
          } else {
            toast.error("Materi tidak ditemukan");
            router.push(`/classes/${classId}`);
          }
        } else {
          toast.error("Materi tidak ditemukan");
          router.push(`/classes/${classId}`);
        }
      } catch (error) {
        console.error("Failed to load material:", error);
        toast.error("Gagal memuat materi");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [classId, materialId, router]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevItem = contentItems[currentIndex - 1];
      if (prevItem.type === "material") {
        router.push(`/classes/${classId}/materials/${prevItem.id}`);
      } else {
        router.push(`/classes/${classId}/quizzes/${prevItem.id}/detail?sectionId=${prevItem.sectionId}`);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < contentItems.length - 1) {
      const nextItem = contentItems[currentIndex + 1];
      if (nextItem.type === "material") {
        router.push(`/classes/${classId}/materials/${nextItem.id}`);
      } else {
        router.push(`/classes/${classId}/quizzes/${nextItem.id}/detail?sectionId=${nextItem.sectionId}`);
      }
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

  if (!currentMaterial) {
    return null;
  }

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < contentItems.length - 1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      {/* Mobile Back Button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="ghost"
          onClick={() => router.push(`/classes/${classId}`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Kelas
        </Button>
      </div>

      <article className="prose prose-slate dark:prose-invert max-w-none">
        <h1 className="text-2xl sm:text-4xl font-bold mb-4">
          {currentMaterial.title}
        </h1>

        {currentMaterial.xp > 0 && (
          <div className="flex items-center gap-2 mb-6 not-prose">
            <Badge variant="secondary" className="text-base">
              <Award className="h-4 w-4 mr-1" />+{currentMaterial.xp} XP
            </Badge>
          </div>
        )}

        <Separator className="my-6" />

        <div 
          className="leading-relaxed"
          dangerouslySetInnerHTML={{ __html: currentMaterial.content }}
        />

        {currentMaterial.video_link && (
          <>
            <Separator className="my-8" />
            <div className="not-prose">
              <h3 className="text-xl font-semibold mb-4">Video Pembelajaran</h3>
              {(() => {
                const videoId = extractYouTubeVideoId(currentMaterial.video_link);
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
                        Link video: {currentMaterial.video_link}
                      </p>
                    </div>
                  );
                }
              })()}
            </div>
          </>
        )}

        {materialFiles.length > 0 && (
          <>
            <Separator className="my-8" />
            <div>
              <h3 className="text-xl font-semibold mb-4">File Lampiran</h3>
              <div className="space-y-3">
                {materialFiles.map((file) => (
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
                        onClick={() => handlePreviewFile(file.url, file.title)}
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

      {/* Navigation Buttons - Mobile Only */}
      <div className="lg:hidden mt-8 flex gap-3">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!hasPrevious}
          className="flex-1"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Sebelumnya
        </Button>
        <Button
          onClick={handleNext}
          disabled={!hasNext}
          className="flex-1"
        >
          Selanjutnya
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
