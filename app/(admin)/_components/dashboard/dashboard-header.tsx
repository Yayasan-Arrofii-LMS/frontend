"use client";

import { PeriodInfo, DashboardQueryParams, DashboardPeriodPreset } from "@/types/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

interface DashboardHeaderProps {
  periodInfo?: PeriodInfo;
  filters: DashboardQueryParams;
  onFilterChange: (filters: DashboardQueryParams) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const MONTH_NAMES = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

export function DashboardHeader({
  periodInfo,
  filters,
  onFilterChange,
  onRefresh,
  isLoading,
}: DashboardHeaderProps) {
  const currentYear = new Date().getFullYear();
  const availableYears = [
    currentYear.toString(),
    (currentYear - 1).toString(),
    (currentYear - 2).toString(),
    (currentYear - 3).toString(),
    (currentYear - 4).toString(),
  ];

  const handlePresetChange = (preset: string) => {
    onFilterChange({
      period: preset as DashboardPeriodPreset,
      year: undefined,
      month: undefined,
    });
  };

  const handleYearChange = (year: string) => {
    onFilterChange({
      ...filters,
      period: undefined,
      year: year,
    });
  };

  const handleMonthChange = (month: string) => {
    if (month === "all") {
      onFilterChange({
        ...filters,
        period: undefined,
        year: filters.year || currentYear.toString(),
        month: undefined,
      });
    } else {
      onFilterChange({
        ...filters,
        period: undefined,
        year: filters.year || currentYear.toString(),
        month: month,
      });
    }
  };

  const handleReset = () => {
    onFilterChange({ period: "this_year" });
  };

  const activePreset = filters.period || (filters.year ? "custom_year" : "this_year");

  return (
    <div className="px-4 lg:px-6 space-y-4">
      {/* Title & Refresh */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Dasbor Analitik LMS
            </h1>
            <Badge
              variant="outline"
              className="hidden sm:inline-flex items-center gap-1.5 py-0.5 px-2.5 bg-primary/10 text-primary border-primary/20 text-xs font-semibold"
            >
              <Calendar className="h-3 w-3" />
              {periodInfo?.label || "Memuat periode..."}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Gambaran komprehensif data pengguna, perkembangan kelas, aktivitas pembelajaran, dan evaluasi kegiatan Sekolah Alam.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="gap-1.5 text-xs font-medium h-9"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Segarkan Data
          </Button>
          {(filters.period !== "this_year" || filters.year || filters.month) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-muted-foreground hover:text-foreground h-9"
            >
              Reset Filter
            </Button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-card border rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground shrink-0">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span>Filter Periode:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full md:w-auto">
          {/* Preset Range */}
          <Select
            value={activePreset}
            onValueChange={handlePresetChange}
          >
            <SelectTrigger className="h-9 w-full sm:w-44 text-xs">
              <SelectValue placeholder="Pilih Periode Cepat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_year">Tahun Ini ({currentYear})</SelectItem>
              <SelectItem value="this_month">Bulan Ini</SelectItem>
              <SelectItem value="last_month">Bulan Lalu</SelectItem>
              <SelectItem value="30d">30 Hari Terakhir</SelectItem>
              <SelectItem value="7d">7 Hari Terakhir</SelectItem>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="last_year">Tahun Lalu ({currentYear - 1})</SelectItem>
            </SelectContent>
          </Select>

          {/* Tahun Picker */}
          <Select
            value={filters.year?.toString() || currentYear.toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="h-9 w-full sm:w-32 text-xs">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((yr) => (
                <SelectItem key={yr} value={yr}>
                  Tahun {yr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Bulan Picker */}
          <Select
            value={filters.month?.toString() || "all"}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="h-9 w-full sm:w-36 text-xs">
              <SelectValue placeholder="Semua Bulan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Bulan</SelectItem>
              {MONTH_NAMES.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
