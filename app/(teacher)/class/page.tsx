"use client";

import React, { useState, useEffect } from "react";
import { Class } from "@/types/class";
import { ClassGrid } from "@/components/class-grid";
import { AddClassModal } from "@/components/add-class-modal";
import { EditClassModal } from "@/components/edit-class-modal";
import { DeleteClassDialog } from "@/components/delete-class-dialog";
import { fetchClasses, deleteClass } from "@/lib/api/classes";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface ClassMeta {
  itemCount: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export default function ClassPage() {
  const [allClasses, setAllClasses] = useState<Class[]>([]); // Store all classes
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]); // For display
  const [meta, setMeta] = useState<ClassMeta | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingClass, setIsDeletingClass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");

  // Load all classes once on mount
  useEffect(() => {
    loadAllClasses();
  }, []);

  // Filter and paginate whenever search or page changes
  useEffect(() => {
    filterAndPaginateClasses();
  }, [searchValue, currentPage, allClasses]);

  const loadAllClasses = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all classes without pagination
      const { classes: fetchedClasses } = await fetchClasses(1, "");
      // Since we're using dummy data, we can fetch all at once
      // In real API, you might need to fetch with a large limit or loop through pages

      setAllClasses(fetchedClasses);
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError("Gagal memuat data kelas");
      toast.error("Gagal memuat data kelas");
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndPaginateClasses = () => {
    let filtered = [...allClasses];

    // Filter by search
    if (searchValue.trim() !== "") {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(
        (cls) =>
          cls.title.toLowerCase().includes(searchLower) ||
          cls.description.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const itemsPerPage = 6;
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedClasses = filtered.slice(startIndex, endIndex);

    setFilteredClasses(paginatedClasses);
    setMeta({
      itemCount: paginatedClasses.length,
      totalItems,
      itemsPerPage,
      totalPages,
      currentPage,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (search: string) => {
    setSearchValue(search);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleAddClass = () => {
    setIsAddModalOpen(true);
  };

  const handleClassAdded = (newClass: Class) => {
    // Add to allClasses array
    setAllClasses((prev) => [newClass, ...prev]);
    setCurrentPage(1);
    setSearchValue(""); // Clear search
  };

  const handleEditClass = (classData: Class) => {
    setSelectedClass(classData);
    setIsEditModalOpen(true);
  };

  const handleClassUpdated = (updatedClass: Class) => {
    // Update in allClasses array
    setAllClasses((prevClasses) =>
      prevClasses.map((cls) =>
        cls.id === updatedClass.id ? updatedClass : cls
      )
    );
  };

  const handleDeleteClass = (classData: Class) => {
    setSelectedClass(classData);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedClass) return;

    setIsDeletingClass(true);
    try {
      await deleteClass(selectedClass.id);
      toast.success("Kelas berhasil dihapus");

      // Remove from allClasses array
      setAllClasses((prev) =>
        prev.filter((cls) => cls.id !== selectedClass.id)
      );

      // Reset to page 1 if current page becomes empty
      const shouldResetPage = filteredClasses.length === 1 && currentPage > 1;
      if (shouldResetPage) {
        setCurrentPage(currentPage - 1);
      }

      setIsDeleteDialogOpen(false);
      setSelectedClass(null);
    } catch (err) {
      console.error("Error deleting class:", err);
      toast.error("Gagal menghapus kelas");
    } finally {
      setIsDeletingClass(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="mb-6">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Skeleton className="h-10 w-full sm:w-96" />
            <Skeleton className="h-10 w-full sm:w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="flex justify-between items-center pt-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6">
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-destructive/10 p-4 mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-destructive">
              Terjadi Kesalahan
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">{error}</p>
            <button
              onClick={() => loadAllClasses()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Coba Lagi
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Manajemen Kelas</h1>
        <p className="text-muted-foreground">
          Kelola semua kelas yang Anda ajar
        </p>
      </div>

      {/* Class Grid with Loading Overlay */}
      <div className="relative">
        <ClassGrid
          data={filteredClasses}
          onEdit={handleEditClass}
          onDelete={handleDeleteClass}
          onAddClass={handleAddClass}
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
    </div>
  );
}
