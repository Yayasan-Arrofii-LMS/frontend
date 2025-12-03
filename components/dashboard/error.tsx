import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorAlert = ({ message, onRetry }: ErrorAlertProps) => (
  <div className="px-4 lg:px-6 mb-4">
    <Card className="border-destructive/20 bg-destructive/5">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-destructive font-medium mb-1">
              Gagal memuat data dasbor
            </p>
            <p className="text-sm text-destructive/80">
              {message}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 text-sm text-destructive hover:text-destructive/80 underline underline-offset-4"
              >
                Coba lagi
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);