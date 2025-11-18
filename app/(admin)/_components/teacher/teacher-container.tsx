"use client";

import { useState, useCallback } from "react";
import { Teacher } from "@/types/teacher";
import { useTeachers } from "@/hooks/use-teachers";
import { ErrorState } from "@/components/error-state";
import { TeacherHeader } from "./teacher-header";
import { TeacherLoading } from "./teacher-loading";
import { TeacherTableSection } from "./teacher-table-section";
import { TeacherModals } from "./teacher-modals";

export function TeacherContainer() {
  const {
    teachers,
    meta,
    isLoading,
    error,
    searchValue,
    handlePageChange,
    handleSearchChange,
    refetch,
  } = useTeachers();

  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleViewDetail = useCallback((teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDetailModalOpen(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedTeacher(null);
  }, []);

  const handleUpdateTeacher = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleDeleteTeacher = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleAddTeacher = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleOpenAddModal = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  return (
    <>
      <TeacherHeader totalItems={meta?.totalItems} />

      {isLoading && (
        <TeacherLoading
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          onAddClick={handleOpenAddModal}
          meta={meta || undefined}
          onPageChange={handlePageChange}
        />
      )}

      {!isLoading && error && (
        <ErrorState message={error} onRetry={refetch} />
      )}

      {!isLoading && !error && (
        <TeacherTableSection
          data={teachers}
          onViewDetail={handleViewDetail}
          onAddTeacher={handleOpenAddModal}
          meta={meta || undefined}
          onPageChange={handlePageChange}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
        />
      )}

      <TeacherModals
        selectedTeacher={selectedTeacher}
        isDetailModalOpen={isDetailModalOpen}
        isAddModalOpen={isAddModalOpen}
        onCloseDetailModal={handleCloseDetailModal}
        onCloseAddModal={handleCloseAddModal}
        onUpdateTeacher={handleUpdateTeacher}
        onDeleteTeacher={handleDeleteTeacher}
        onAddTeacher={handleAddTeacher}
      />
    </>
  );
}
