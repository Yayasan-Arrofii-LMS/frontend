import { Teacher } from "@/types/teacher";
import { TeacherTable } from "@/components/teacher-table";

interface TeacherTableSectionProps {
  data: Teacher[];
  onViewDetail: (teacher: Teacher) => void;
  onAddTeacher: () => void;
  meta?: {
    itemCount: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  onPageChange: (page: number) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function TeacherTableSection({
  data,
  onViewDetail,
  onAddTeacher,
  meta,
  onPageChange,
  searchValue,
  onSearchChange,
}: TeacherTableSectionProps) {
  return (
    <div className="px-4 lg:px-6">
      <TeacherTable
        data={data}
        onViewDetail={onViewDetail}
        onAddTeacher={onAddTeacher}
        meta={meta}
        onPageChange={onPageChange}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
      />
    </div>
  );
}
