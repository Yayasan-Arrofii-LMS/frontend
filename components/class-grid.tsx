"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Class } from "@/types/class";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";

interface ClassGridProps {
  data: Class[];
  onEdit: (classData: Class) => void;
  onDelete: (classData: Class) => void;
  onAddClass: () => void;
  onView?: (classData: Class) => void;
  meta?: {
    itemCount: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  onPageChange?: (page: number) => void;
  onSearchChange?: (search: string) => void;
  searchValue?: string;
}

export function ClassGrid({
  data,
  onEdit,
  onView,
  onDelete,
  onAddClass,
  meta,
  onPageChange,
  onSearchChange,
  searchValue = "",
}: ClassGridProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    onSearchChange?.(value);
  };

  const handlePageClick = (page: number) => {
    onPageChange?.(page);
  };

  // Generate page numbers
  const generatePageNumbers = () => {
    if (!meta) return [];
    const pages = [];
    const { currentPage, totalPages } = meta;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push(-1); // ellipsis
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // ellipsis
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cari kelas..."
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={onAddClass} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Buat Kelas Baru
        </Button>
      </div>

      {/* Empty State */}
      {data.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {localSearch
                ? "Tidak ada kelas yang ditemukan"
                : "Belum ada kelas"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {localSearch
                ? "Coba ubah kata kunci pencarian Anda"
                : "Mulai buat kelas pertama Anda untuk mengelola pembelajaran"}
            </p>
            {!localSearch && (
              <Button onClick={onAddClass}>
                <Plus className="mr-2 h-4 w-4" />
                Buat Kelas Pertama
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Class Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((classItem) => (
              <Card
                key={classItem.id}
                className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer p-0"
                onClick={() => onView?.(classItem)}
              >
                {/* Cover Image */}
                <div className="relative h-48 overflow-hidden bg-muted">
                  <Image
                    src={classItem.coverImage}
                    alt={classItem.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Action Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(classItem);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(classItem);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Card Content */}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                    {classItem.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {classItem.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex flex-col items-center gap-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        meta.currentPage > 1 &&
                        handlePageClick(meta.currentPage - 1)
                      }
                      className={
                        meta.currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {generatePageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === -1 ? (
                        <span className="px-4 py-2">...</span>
                      ) : (
                        <PaginationLink
                          onClick={() => handlePageClick(page)}
                          isActive={meta.currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        meta.currentPage < meta.totalPages &&
                        handlePageClick(meta.currentPage + 1)
                      }
                      className={
                        meta.currentPage === meta.totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <p className="text-sm text-muted-foreground">
                Menampilkan {meta.itemCount} dari {meta.totalItems} kelas
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
