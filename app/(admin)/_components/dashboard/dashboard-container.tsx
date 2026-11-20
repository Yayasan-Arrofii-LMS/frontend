"use client";

import { useDashboard } from "@/hooks/use-dashboard";
import { DashboardHeader } from "./dashboard-header";
import { StatsCards } from "./stats-cards";
import { ChartSection } from "./chart-section";
import { DashboardLoading } from "./dashboard-loading";
import { ErrorState } from "@/components/error-state";

export function DashboardContainer() {
  const { data, isLoading, error, filters, setFilters, refetch } = useDashboard({
    period: "this_year",
  });

  if (isLoading && !data) {
    return <DashboardLoading />;
  }

  if (error && !data) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  if (!data) {
    return <ErrorState message="Tidak ada data dashboard yang tersedia" onRetry={refetch} />;
  }

  return (
    <div className="space-y-6 pb-12 transition-opacity duration-200">
      {/* Header with Integrated Time Filters */}
      <DashboardHeader
        periodInfo={data.periodInfo}
        filters={filters}
        onFilterChange={setFilters}
        onRefresh={refetch}
        isLoading={isLoading}
      />


      {/* Main KPI Stats Cards */}
      <div className="px-4 lg:px-6">
        <StatsCards data={data} />
      </div>

      {/* Interactive Analytics & Visualizations Charts */}
      <ChartSection data={data} />

    </div>
  );
}
