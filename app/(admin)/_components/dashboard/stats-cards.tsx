import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardData } from "@/types/dashboard";

interface StatsCardsProps {
  data: DashboardData;
}

// Helper function to format ratio
function formatRatio(numerator: number, denominator: number): string {
  if (denominator === 0) return "0";
  const ratio = numerator / denominator;
  return ratio % 1 === 0 ? ratio.toString() : ratio.toFixed(2);
}

export function StatsCards({ data }: StatsCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Guru</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.teacherCount.toLocaleString()}
          </CardTitle>
          <CardAction>
            {/* <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge> */}
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Siswa</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.studentCount.toLocaleString()}
          </CardTitle>
          <CardAction>
            {/* <Badge variant="outline">
              <IconTrendingDown />
              -20%
            </Badge> */}
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Kelas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.classCount.toLocaleString()}
          </CardTitle>
          <CardAction>
            {/* <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge> */}
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Rasio Siswa:Guru</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatRatio(data.studentCount, data.teacherCount)}:1
          </CardTitle>
          <CardAction>
            {/* <Badge variant="outline">
              <IconTrendingUp />
              +4.5%
            </Badge> */}
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  );
}
