"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchStudentClassDetail } from "@/lib/api/classes";
import { ClassContentSidebar } from "@/components/class/class-content-sidebar";
import { toast } from "sonner";

interface Section {
  id: number;
  name: string;
  description: string;
  order: number;
  materials: Array<{
    id: number;
    title: string;
    type: string;
  }>;
  quizzes: Array<{
    id: number;
    title: string;
    totalQuestions: number;
  }>;
}

export default function ClassContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const classId = params.id as string;

  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set()
  );
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    async function loadSections() {
      try {
        setIsLoading(true);
        const classData = await fetchStudentClassDetail(classId);
        setSections(classData.sections);

        // Expand all sections by default
        const allSectionIds = new Set(classData.sections.map((s) => s.id));
        setExpandedSections(allSectionIds);
      } catch (error) {
        console.error("Failed to load sections:", error);
        toast.error("Gagal memuat daftar konten");
      } finally {
        setIsLoading(false);
      }
    }

    loadSections();
  }, [classId]);

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Extract current item info from URL
  const materialId = params.materialId
    ? parseInt(params.materialId as string)
    : null;
  const quizId = params.quizId ? parseInt(params.quizId as string) : null;

  const currentItemId = materialId || quizId || 0;
  const currentItemType = materialId ? "material" : "quiz";

  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="hidden lg:block w-80 border-r bg-muted animate-pulse" />
        <div className="flex-1">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      <ClassContentSidebar
        sections={sections}
        currentItemId={currentItemId}
        currentItemType={currentItemType as "material" | "quiz"}
        expandedSections={expandedSections}
        onToggleSection={toggleSection}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
