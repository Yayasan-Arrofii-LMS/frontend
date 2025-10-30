"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Class } from "@/types/class";
import { ClassGrid } from "@/components/class-grid";
import { AddClassModal } from "@/components/add-class-modal";
import { EditClassModal } from "@/components/edit-class-modal";
import { DeleteClassDialog } from "@/components/delete-class-dialog";
import { ClassGridSkeleton } from "@/components/class-grid-skeleton";
import { ErrorState } from "@/components/error-state";
import { useClasses } from "@/hooks/use-classes";

export function ClassManagementContent() {
  const router = useRouter();
  const {
    classes,
    meta,
    isLoading,
    error,
    searchValue,
    isDeletingClass,
    handlePageChange,
    handleSearchChange,
    handleDeleteClass,
    refetch,
  } = useClasses();

  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleViewClass = useCallback((classData: Class) => {
    router.push(`/class/${classData.id}`);
  }, [router]);

  const handleAddClass = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const handleClassAdded = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleEditClass = useCallback((classData: Class) => {
    setSelectedClass(classData);
    setIsEditModalOpen(true);
  }, []);

  const handleClassUpdated = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleDeleteClassClick = useCallback((classData: Class) => {
    setSelectedClass(classData);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedClass) return;

    try {
      await handleDeleteClass(selectedClass.id);
      setIsDeleteDialogOpen(false);
      setSelectedClass(null);
    } catch {
      // Error handled in hook
    }
  }, [selectedClass, handleDeleteClass]);

  if (isLoading) {
    return <ClassGridSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Manajemen Kelas</h1>
        <p className="text-muted-foreground">
          Kelola semua kelas yang Anda ajar
        </p>
      </div>

      {/* Class Grid */}
      <div className="relative">
        <ClassGrid
          data={classes}
          onEdit={handleEditClass}
          onDelete={handleDeleteClassClick}
          onAddClass={handleAddClass}
          onView={handleViewClass}
          meta={meta || undefined}
          onPageChange={handlePageChange}
          onSearchChange={handleSearchChange}
          searchValue={searchValue}
        />
      </div>

      {/* Modals */}
      <AddClassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleClassAdded}
      />

      <EditClassModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedClass(null);
        }}
        onUpdate={handleClassUpdated}
        classData={selectedClass}
      />

      <DeleteClassDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedClass(null);
        }}
        onDelete={handleConfirmDelete}
        classData={selectedClass}
        isLoading={isDeletingClass}
      />
    </>
  );
}
