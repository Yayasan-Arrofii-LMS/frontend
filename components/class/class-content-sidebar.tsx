"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Menu,
  ChevronDown,
  ChevronRight,
  FileText,
  BookOpen,
  ArrowLeft,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface ClassContentSidebarProps {
  sections: Section[];
  currentItemId: number;
  currentItemType: "material" | "quiz";
  expandedSections: Set<number>;
  onToggleSection: (sectionId: number) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

function SidebarContent({
  sections,
  currentItemId,
  currentItemType,
  expandedSections,
  onToggleSection,
}: ClassContentSidebarProps) {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b sticky top-0 bg-background z-10">
        <h2 className="font-semibold text-lg">Daftar Isi</h2>
      </div>
      <div className="p-4">
        <div className="space-y-2">
          {sections.map((section) => (
            <Collapsible
              key={section.id}
              open={expandedSections.has(section.id)}
              onOpenChange={() => onToggleSection(section.id)}
            >
              <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-accent rounded-lg text-left">
                {expandedSections.has(section.id) ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
                <span className="font-medium text-sm">{section.name}</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="ml-6 mt-1 space-y-1">
                {/* Materials */}
                {section.materials.map((material) => (
                  <button
                    key={`material-${material.id}`}
                    onClick={() =>
                      router.push(
                        `/classes/${classId}/materials/${material.id}`
                      )
                    }
                    className={cn(
                      "flex items-center gap-2 w-full p-2 rounded-lg text-sm hover:bg-accent",
                      currentItemType === "material" &&
                        currentItemId === material.id &&
                        "bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left truncate">
                      {material.title}
                    </span>
                  </button>
                ))}

                {/* Quizzes */}
                {section.quizzes.map((quiz) => (
                  <button
                    key={`quiz-${quiz.id}`}
                    onClick={() =>
                      router.push(
                        `/classes/${classId}/quizzes/${quiz.id}/detail?sectionId=${section.id}`
                      )
                    }
                    className={cn(
                      "flex items-center gap-2 w-full p-2 rounded-lg text-sm hover:bg-accent",
                      currentItemType === "quiz" &&
                        currentItemId === quiz.id &&
                        "bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                  >
                    <BookOpen className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left truncate">
                      {quiz.title}
                    </span>
                  </button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ClassContentSidebar({
  sections,
  currentItemId,
  currentItemType,
  expandedSections,
  onToggleSection,
  isCollapsed = false,
  onToggleCollapse,
}: ClassContentSidebarProps) {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden lg:flex flex-col border-r bg-background h-full transition-all duration-300",
          isCollapsed ? "w-16" : "w-80"
        )}
      >
        <div className="p-4 border-b flex items-center gap-3 flex-shrink-0">
          {!isCollapsed && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/classes/${classId}`)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="font-semibold flex-1">Konten Kelas</h1>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="ml-auto"
          >
            {isCollapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
        </div>
        {!isCollapsed && (
          <div className="flex-1 overflow-hidden">
            <SidebarContent
              sections={sections}
              currentItemId={currentItemId}
              currentItemType={currentItemType}
              expandedSections={expandedSections}
              onToggleSection={onToggleSection}
            />
          </div>
        )}
      </div>
    </>
  );
}
