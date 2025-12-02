"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Award, FileDown } from "lucide-react";
import { fetchStudentClassDetail } from "@/lib/api/classes";
import {
  fetchSectionMaterials,
  StudentMaterial,
} from "@/lib/api/student-materials";
import { toast } from "sonner";

export default function MaterialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  const materialId = parseInt(params.materialId as string);

  const [currentMaterial, setCurrentMaterial] =
    useState<StudentMaterial | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        const classData = await fetchStudentClassDetail(classId);

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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!currentMaterial) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <article className="prose prose-slate dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-4">{currentMaterial.title}</h1>

        {currentMaterial.xp > 0 && (
          <div className="flex items-center gap-2 mb-6 not-prose">
            <Badge variant="secondary" className="text-base">
              <Award className="h-4 w-4 mr-1" />
              +{currentMaterial.xp} XP
            </Badge>
          </div>
        )}

        <Separator className="my-6" />

        <div className="whitespace-pre-wrap leading-relaxed">
          {currentMaterial.content}
        </div>

        {currentMaterial.Material_File.length > 0 && (
          <>
            <Separator className="my-8" />
            <div>
              <h3 className="text-xl font-semibold mb-4">File Lampiran</h3>
              <div className="space-y-2">
                {currentMaterial.Material_File.map((file) => (
                  <a
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent transition-colors no-underline"
                  >
                    <FileDown className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        File {file.type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Klik untuk membuka
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </article>
    </div>
  );
}
