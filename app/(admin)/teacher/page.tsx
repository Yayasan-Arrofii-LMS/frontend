"use client";

import React, { useState, useEffect } from "react";
import { Teacher } from "@/types/teacher";
import { TeacherTable } from "@/components/teacher-table";
import { TeacherDetailModal } from "@/components/teacher-detail-modal";
import { AddTeacherModal } from "@/components/add-teacher-modal";
import { fetchTeachers } from "@/lib/api/teachers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TeacherMeta {
  itemCount: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export default function TeacherPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [meta, setMeta] = useState<TeacherMeta | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      const loadTeachers = async () => {
        const isInitialLoad = isLoading; // Jika masih dalam state loading awal
        const isSearch = searchValue.trim() !== "";

        try {
          if (isInitialLoad) {
            setIsLoading(true);
          } else {
            // Always show loading state for better UX
            setIsLoadingData(true);
          }
          setError(null);
          const result = await fetchTeachers(
            currentPage,
            searchValue || undefined
          );
          setTeachers(result.teachers);
          setMeta(result.meta);
        } catch (error) {
          console.error("Failed to fetch teachers:", error);
          setError(
            error instanceof Error ? error.message : "Failed to fetch teachers"
          );
        } finally {
          if (isInitialLoad) {
            // Add slight delay for smooth transition from skeleton to data
            setTimeout(() => {
              setIsLoading(false);
            }, 200);
          } else {
            // Add slight delay for smooth transition
            setTimeout(() => {
              setIsLoadingData(false);
            }, 150);
          }
        }
      };

      loadTeachers();
    }, 600); // Balanced debounce for good UX with skeleton loading

    return () => clearTimeout(timeoutId);
  }, [currentPage, searchValue, isLoading]);

  const handleViewDetail = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTeacher(null);
  };

  const handleUpdateTeacher = (updatedTeacher: Teacher) => {
    setTeachers((prev) =>
      prev.map((teacher) =>
        teacher.id === updatedTeacher.id ? updatedTeacher : teacher
      )
    );
  };

  const handleDeleteTeacher = (teacherId: string) => {
    setTeachers((prev) => prev.filter((teacher) => teacher.id !== teacherId));
  };

  const handleAddTeacher = (newTeacher: Teacher) => {
    setTeachers((prev) => [newTeacher, ...prev]);
    // Optionally refresh the data to get updated pagination
    if (meta) {
      setMeta({
        ...meta,
        totalItems: meta.totalItems + 1,
        itemCount: Math.min(meta.itemsPerPage, meta.itemCount + 1),
      });
    }
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (search: string) => {
    setSearchValue(search);
    // Reset to first page when search changes
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="px-4 lg:px-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="rounded-md border">
          <div className="p-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Error component
  const ErrorDisplay = () => (
    <div className="px-4 lg:px-6">
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardHeader>
          <CardTitle className="text-red-800 dark:text-red-200">
            Error Loading Teachers
          </CardTitle>
          <CardDescription className="text-red-700 dark:text-red-300">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 dark:text-red-400">
            Please check your API connection and try refreshing the page.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
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
          </div>

          {isLoading && <LoadingSkeleton />}

          {!isLoading && (
            <div className="px-4 lg:px-6">
              {error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">Error: {error}</p>
                </div>
              ) : (
                <TeacherTable
                  data={teachers}
                  onViewDetail={handleViewDetail}
                  onAddTeacher={handleOpenAddModal}
                  meta={meta || undefined}
                  onPageChange={handlePageChange}
                  isLoading={isLoadingData}
                  searchValue={searchValue}
                  onSearchChange={handleSearchChange}
                />
              )}
            </div>
          )}
        </div>
      </div>

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
    </div>
  );
}
