"use client";

import React, { useState, useEffect } from "react";
import { Teacher } from "@/types/teacher";
import { TeacherTable } from "@/components/teacher-table";
import { TeacherDetailModal } from "@/components/teacher-detail-modal";
import { AddTeacherModal } from "@/components/add-teacher-modal";
import { fetchTeachers } from "@/lib/api/teachers";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Search } from "lucide-react";

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
  const [isPageChanging, setIsPageChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const loadTeachers = async () => {
      const isInitialLoad = isLoading;

      try {
        if (isInitialLoad) {
          setIsLoading(true);
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
          setTimeout(() => {
            setIsLoading(false);
          }, 200);
        } else {
          setIsPageChanging(false);
        }
      }
    };

    // Debounce hanya untuk search, tidak untuk pagination
    if (searchValue.trim() !== "" && !isPageChanging) {
      const timeoutId = setTimeout(() => {
        loadTeachers();
      }, 600);
      return () => clearTimeout(timeoutId);
    } else {
      // Langsung load untuk pagination atau initial load
      loadTeachers();
    }
  }, [currentPage, searchValue, isLoading, isPageChanging]);

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
    // Update meta to reflect deleted teacher
    if (meta) {
      setMeta({
        ...meta,
        totalItems: meta.totalItems - 1,
        itemCount: Math.max(0, meta.itemCount - 1),
      });
    }
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
    setIsPageChanging(true);
    setCurrentPage(page);
  };

  const handleSearchChange = (search: string) => {
    setSearchValue(search);
    // Reset to first page when search changes
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // Loading skeleton component - hanya untuk data rows
  const LoadingSkeleton = () => (
    <div className="px-4 lg:px-6">
      <div className="space-y-4">
        {/* Search dan Add Button tetap ditampilkan */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari guru..."
              value={searchValue}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={handleOpenAddModal}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Guru
          </Button>
        </div>

        {/* Table dengan skeleton hanya di bagian data */}
        <div className="rounded-md border">
          <Table>
            {/* Header tetap ditampilkan */}
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Profile</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Hanya skeleton rows */}
              {Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination tetap ditampilkan jika ada meta */}
        {meta && meta.totalPages > 1 && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-sm text-muted-foreground text-center">
              Menampilkan{" "}
              {Math.min(
                (meta.currentPage - 1) * meta.itemsPerPage + 1,
                meta.totalItems
              )}
              {" - "}
              {Math.min(
                meta.currentPage * meta.itemsPerPage,
                meta.totalItems
              )}{" "}
              dari {meta.totalItems} guru
            </div>
            <Pagination>
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      handlePageChange(Math.max(1, meta.currentPage - 1))
                    }
                    className={
                      meta.currentPage <= 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                {/* Simplified pagination untuk loading state */}
                <PaginationItem>
                  <PaginationLink isActive>{meta.currentPage}</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      handlePageChange(
                        Math.min(meta.totalPages, meta.currentPage + 1)
                      )
                    }
                    className={
                      meta.currentPage >= meta.totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
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

          {(isLoading || isPageChanging) && <LoadingSkeleton />}

          {!isLoading && !isPageChanging && (
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
