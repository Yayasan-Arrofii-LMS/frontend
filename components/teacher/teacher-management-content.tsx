"use client";

import { useState, useCallback } from "react";
import { Teacher } from "@/types/teacher";
import { TeacherTable } from "@/components/teacher-table";
import { TeacherDetailModal } from "@/components/teacher-detail-modal";
import { AddTeacherModal } from "@/components/add-teacher-modal";
import { TeacherTableSkeleton } from "@/components/teacher-table-skeleton";
import { ErrorState } from "@/components/error-state";
import { useTeachers } from "@/hooks/use-teachers";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TeacherManagementContent() {
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
  const [showPassword, setShowPassword] = useState(false);

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
      {/* Page Header */}
      <div className="px-4 lg:px-6 space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Manajemen Guru
          </h1>
          <p className="text-muted-foreground">
            Kelola data guru dan informasi profil mereka
            {meta && (
              <span className="ml-2 text-sm">
                ({meta.totalItems} total guru)
              </span>
            )}
          </p>
        </div>
        
        {/* Password Default Info */}
        <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-blue-900 dark:text-blue-100">
                Password default untuk akun guru baru:
              </span>
              <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-sm font-mono text-blue-900 dark:text-blue-100">
                {showPassword ? "Password@123" : "••••••••••••"}
              </code>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
              className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </AlertDescription>
        </Alert>
      </div>

      {/* Loading State */}
      {isLoading && (
        <TeacherTableSkeleton
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          onAddClick={handleOpenAddModal}
          meta={meta || undefined}
          onPageChange={handlePageChange}
        />
      )}

      {/* Error State */}
      {!isLoading && error && (
        <ErrorState message={error} onRetry={refetch} />
      )}

      {/* Data Table */}
      {!isLoading && !error && (
        <div className="px-4 lg:px-6">
          <TeacherTable
            data={teachers}
            onViewDetail={handleViewDetail}
            onAddTeacher={handleOpenAddModal}
            meta={meta || undefined}
            onPageChange={handlePageChange}
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
          />
        </div>
      )}

      {/* Modals */}
      <TeacherDetailModal
        teacher={selectedTeacher}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onUpdate={handleUpdateTeacher}
        onDelete={handleDeleteTeacher}
      />

      <AddTeacherModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onAdd={handleAddTeacher}
      />
    </>
  );
}
