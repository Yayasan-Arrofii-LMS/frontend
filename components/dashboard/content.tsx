import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { SectionCards } from '@/components/section-cards';
import { DashboardData } from '@/types/dashboard';

interface DashboardContentProps {
  data: DashboardData;
}

export const DashboardContent = ({ data }: DashboardContentProps) => (
  <>
    <SectionCards data={data} />
    <div className="px-4 lg:px-6">
      <ChartAreaInteractive data={data} />
    </div>
  </>
);