"use client";

import { useDashboard } from "@/hooks/use-dashboard";
import { DashboardHeader } from "./dashboard-header";
import { StatsCards } from "./stats-cards";
import { ChartSection } from "./chart-section";
import { DashboardLoading } from "./dashboard-loading";
import { ErrorState } from "@/components/error-state";

export function DashboardContainer() {
  const { data, isLoading, error, refetch } = useDashboard();

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
      <div className="px-4 lg:px-6">
        <StatsCards data={data} />
      </div>
      <ChartSection data={data} />
    </div>
  );
}
