import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { fetchDashboardData } from "@/lib/api/dashboard";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

async function DashboardContent() {
  try {
    const response = await fetchDashboardData();
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch dashboard data');
    }

    return (
      <>
        <SectionCards data={response.data} />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive data={response.data} />
        </div>
      </>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    
    const fallbackData = {
      teacherCount: 10,
      studentCount: 100,
      classCount: 10,
      Chart: {
        teacher: {
          oneYear: {
            "1": 1, "2": 1, "3": 0, "4": 0, "5": 2, "6": 1,
            "7": 1, "8": 1, "9": 1, "10": 0, "11": 0, "12": 0
          },
          fiveYear: {
            "2021": 0, "2022": 0, "2023": 0, "2024": 2, "2025": 8
          }
        },
        student: {
          oneYear: {
            "1": 6, "2": 5, "3": 11, "4": 7, "5": 8, "6": 9,
            "7": 12, "8": 9, "9": 9, "10": 0, "11": 0, "12": 0
          },
          fiveYear: {
            "2021": 0, "2022": 0, "2023": 0, "2024": 24, "2025": 76
          }
        }
      }
    };
    
    return (
      <>
        <div className="px-4 lg:px-6 mb-4">
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <CardContent className="pt-6">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                ⚠️ Using fallback data. API connection failed: {error instanceof Error ? error.message : 'Unknown error'}
              </p>
            </CardContent>
          </Card>
        </div>
        <SectionCards data={fallbackData} />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive data={fallbackData} />
        </div>
      </>
    );
  }
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
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <Suspense fallback={<DashboardLoading />}>
            <DashboardContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
