"use client";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { fetchDashboardData } from "@/lib/api/dashboard";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardData } from "@/types/dashboard";

// Loading components
function SectionCardsLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <CardDescription>
              <Skeleton className="h-4 w-24" />
            </CardDescription>
            <CardTitle>
              <Skeleton className="h-8 w-16" />
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

function ChartLoading() {
  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-48" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardLoading() {
  return (
    <>
      <SectionCardsLoading />
      <ChartLoading />
    </>
  );
}

export default function Page() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetchDashboardData();
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch dashboard data');
        }

        setDashboardData(response.data);
      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {isLoading && <DashboardLoading />}
          
          {error && (
            <div className="px-4 lg:px-6">
              <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                <CardHeader>
                  <CardTitle className="text-red-800 dark:text-red-200">
                    Error Loading Dashboard
                  </CardTitle>
                  <CardDescription className="text-red-700 dark:text-red-300">
                    {error}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Please check your API connection and try refreshing the page.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {!isLoading && !error && dashboardData && (
            <>
              <SectionCards data={dashboardData} />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive data={dashboardData} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
