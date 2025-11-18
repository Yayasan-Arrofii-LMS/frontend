import { TeacherTableSkeleton } from "@/components/teacher-table-skeleton";

interface TeacherLoadingProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
  meta?: {
    itemCount: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  onPageChange: (page: number) => void;
}

export function TeacherLoading({
  searchValue,
  onSearchChange,
  onAddClick,
  meta,
  onPageChange,
}: TeacherLoadingProps) {
  return (
    <TeacherTableSkeleton
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      onAddClick={onAddClick}
      meta={meta}
      onPageChange={onPageChange}
    />
  );
}
