import { useState, useEffect, useCallback } from "react";
import { DashboardData, DashboardQueryParams } from "@/types/dashboard";
import { fetchDashboardData } from "@/lib/api/dashboard";

interface UseDashboardReturn {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  filters: DashboardQueryParams;
  setFilters: React.Dispatch<React.SetStateAction<DashboardQueryParams>>;
  updateFilter: (key: keyof DashboardQueryParams, value: any) => void;
  refetch: () => Promise<void>;
}

export function useDashboard(initialFilters?: DashboardQueryParams): UseDashboardReturn {
  const [filters, setFilters] = useState<DashboardQueryParams>(
    initialFilters || { period: "this_year" }
  );
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchDashboardData(filters);

      if (!response.success) {
        throw new Error(response.message || "Gagal mengambil data analitik dashboard");
      }

      setData(response.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Terjadi kesalahan saat memuat dashboard";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const updateFilter = useCallback(
    (key: keyof DashboardQueryParams, value: any) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  return {
    data,
    isLoading,
    error,
    filters,
    setFilters,
    updateFilter,
    refetch: loadDashboardData,
  };
}
