"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { DashboardHeader } from "./dashboard-header";
import { StatsCards } from "./stats-cards";
import { ChartSection } from "./chart-section";
import { DashboardLoading } from "./dashboard-loading";
import { ErrorState } from "@/components/error-state";
import { fetchPendingClasses } from "@/lib/api/classes";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardContainer() {
  const { data, isLoading, error, refetch } = useDashboard();
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    async function loadPending() {
      try {
        const { meta } = await fetchPendingClasses(1, 1);
        setPendingCount(meta.totalItems);
      } catch {
        // Silently catch
      }
    }
    loadPending();
  }, []);

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  if (!data) {
    return <ErrorState message="No data available" onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader />
      {pendingCount > 0 && (
        <div className="mx-4 lg:mx-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold text-sm">
                Ada {pendingCount} kelas menunggu persetujuan
              </p>
              <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
                Kelas yang dibuat oleh Guru memerlukan peninjauan dan persetujuan Admin sebelum aktif.
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="border-amber-500/40 text-xs shrink-0 self-end sm:self-center" asChild>
            <Link href="/course">
              Tinjau Sekarang
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      )}
      <div className="px-4 lg:px-6">
        <StatsCards data={data} />
      </div>
      <ChartSection data={data} />
    </div>
  );
}
