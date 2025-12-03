import { Card, CardContent } from '@/components/ui/card';
import { Database } from 'lucide-react';

interface EmptyStateProps {
  onRetry?: () => void;
}

export const EmptyState = ({ onRetry }: EmptyStateProps) => (
  <div className="px-4 lg:px-6">
    <Card className="p-8">
      <CardContent className="text-center">
        <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Data Tidak Tersedia
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Data dasbor saat ini tidak tersedia. Silakan coba refresh halaman.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-primary hover:text-primary/80 underline underline-offset-4"
          >
            Muat Ulang Data
          </button>
        )}
      </CardContent>
    </Card>
  </div>
);