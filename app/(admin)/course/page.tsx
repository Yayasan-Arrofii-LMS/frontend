"use client";

import { useState, useEffect } from "react";
import { ClassManagementContent } from "@/components/class/class-management-content";
import { AdminApprovalQueue } from "@/components/class/admin-approval-queue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock } from "lucide-react";
import { fetchPendingClasses } from "@/lib/api/classes";

export default function CoursePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    async function checkPendingCount() {
      try {
        const { meta } = await fetchPendingClasses(1, 1);
        setPendingCount(meta.totalItems);
      } catch {
        // Silently catch in background
      }
    }
    checkPendingCount();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 md:px-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between border-b pb-3 flex-wrap gap-4">
          <TabsList className="bg-muted">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Semua Kelas</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Antrean Persetujuan</span>
              {pendingCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-1 h-5 min-w-5 px-1.5 rounded-full text-xs font-semibold"
                >
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0">
          <ClassManagementContent basePath="/course" />
        </TabsContent>

        <TabsContent value="pending" className="mt-0">
          <AdminApprovalQueue onCountChange={setPendingCount} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
