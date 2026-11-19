"use client";

import { useEffect, useState, useCallback } from "react";
import { Class } from "@/types/class";
import {
  fetchPendingClasses,
  approveClass,
  rejectClass,
} from "@/lib/api/classes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Check,
  X,
  Loader2,
  RefreshCw,
  Search,
  ExternalLink,
  Clock,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { ClassCoverImage } from "@/components/class/class-cover-image";
import Link from "next/link";

interface AdminApprovalQueueProps {
  onCountChange?: (count: number) => void;
}

export function AdminApprovalQueue({ onCountChange }: AdminApprovalQueueProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionClassId, setActionClassId] = useState<string | null>(null);

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedClassForReject, setSelectedClassForReject] = useState<Class | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadPendingClasses = useCallback(async () => {
    try {
      setIsLoading(true);
      const { classes: data, meta } = await fetchPendingClasses(
        currentPage,
        10,
        debouncedSearch
      );
      setClasses(data);
      setTotalPages(meta.totalPages);
      setTotalItems(meta.totalItems);
      onCountChange?.(meta.totalItems);
    } catch (error) {
      console.error("Gagal memuat antrean kelas:", error);
      toast.error("Gagal memuat daftar antrean persetujuan kelas");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, onCountChange]);

  useEffect(() => {
    loadPendingClasses();
  }, [loadPendingClasses]);

  const handleApprove = async (classItem: Class) => {
    try {
      setActionClassId(classItem.id);
      setIsProcessing(true);
      await approveClass(classItem.id);
      toast.success(`Kelas "${classItem.title}" berhasil disetujui`);
      await loadPendingClasses();
    } catch (error) {
      console.error("Gagal menyetujui kelas:", error);
      toast.error(error instanceof Error ? error.message : "Gagal menyetujui kelas");
    } finally {
      setIsProcessing(false);
      setActionClassId(null);
    }
  };

  const handleOpenRejectModal = (classItem: Class) => {
    setSelectedClassForReject(classItem);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedClassForReject) return;
    try {
      setIsProcessing(true);
      await rejectClass(selectedClassForReject.id, rejectionReason.trim() || undefined);
      toast.success(`Kelas "${selectedClassForReject.title}" telah ditolak`);
      setRejectModalOpen(false);
      setSelectedClassForReject(null);
      setRejectionReason("");
      await loadPendingClasses();
    } catch (error) {
      console.error("Gagal menolak kelas:", error);
      toast.error(error instanceof Error ? error.message : "Gagal menolak kelas");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Antrean Persetujuan Kelas Guru
              </CardTitle>
              <CardDescription>
                Kelas yang dibuat oleh Guru memerlukan peninjauan dan persetujuan Admin sebelum dapat diakses siswa.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadPendingClasses}
              disabled={isLoading || isProcessing}
              className="shrink-0"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Segarkan
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kelas atau nama guru..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" />
              <p>Memuat antrean kelas...</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg border-dashed">
              <div className="rounded-full bg-muted p-4 mb-3">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">
                {debouncedSearch ? "Tidak ada hasil yang cocok" : "Tidak ada antrean kelas"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {debouncedSearch
                  ? "Coba gunakan kata kunci pencarian yang lain."
                  : "Semua kelas yang diajukan oleh Guru telah diproses dan disetujui."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Kelas</TableHead>
                    <TableHead>Guru Pengajar</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Mekanisme Pendaftaran</TableHead>
                    <TableHead>Tanggal Pengajuan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((cls) => {
                    const teacher = cls.teachers?.[0] || {
                      name: cls.teacherName || "Guru",
                      email: "",
                    };
                    const isRowBusy = isProcessing && actionClassId === cls.id;

                    return (
                      <TableRow key={cls.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-16 rounded overflow-hidden shrink-0 bg-muted">
                              <ClassCoverImage src={cls.coverImage} alt={cls.title} />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium line-clamp-1">{cls.title}</div>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {cls.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{teacher.name}</div>
                            {teacher.email && (
                              <div className="text-xs text-muted-foreground">{teacher.email}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {cls.category ? (
                            <Badge variant="secondary" className="font-normal text-xs">
                              {typeof cls.category === "object" ? cls.category.name : cls.category}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {cls.registrationType === "MANUAL" ? (
                            <Badge
                              variant="outline"
                              className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                            >
                              Persetujuan Guru
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30"
                            >
                              Pendaftaran Terbuka
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(cls.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-8 px-2 text-xs"
                            >
                              <Link href={`/course/${cls.id}`} target="_blank">
                                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                Tinjau
                              </Link>
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                              disabled={isProcessing}
                              onClick={() => handleApprove(cls)}
                            >
                              {isRowBusy ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <>
                                  <Check className="h-3.5 w-3.5 mr-1" />
                                  Setujui
                                </>
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 text-xs"
                              disabled={isProcessing}
                              onClick={() => handleOpenRejectModal(cls)}
                            >
                              <X className="h-3.5 w-3.5 mr-1" />
                              Tolak
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => currentPage > 1 && setCurrentPage((p) => p - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => currentPage < totalPages && setCurrentPage((p) => p + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Modal with reason input */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Tolak Persetujuan Kelas
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menolak kelas{" "}
              <span className="font-semibold text-foreground">
                "{selectedClassForReject?.title}"
              </span>
              ? Berikan alasan penolakan agar Guru dapat memperbaiki kelas ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label className="text-sm font-medium">Alasan Penolakan (Opsional)</label>
            <Textarea
              placeholder="Contoh: Deskripsi kelas belum lengkap, materi belum memenuhi standar, dsb..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {rejectionReason.length}/500 karakter
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setRejectModalOpen(false)}
              disabled={isProcessing}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menolak...
                </>
              ) : (
                "Tolak Kelas"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
