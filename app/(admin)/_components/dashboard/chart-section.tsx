import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DashboardData } from "@/types/dashboard";

interface ChartSectionProps {
  data: DashboardData;
}

export function ChartSection({ data }: ChartSectionProps) {
  return (
    <div className="px-4 lg:px-6">
      <ChartAreaInteractive data={data} />
    </div>
  );
}
