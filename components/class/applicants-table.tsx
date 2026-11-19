"use client";

import { useEffect, useState } from "react";
import { Applicant } from "@/types/class";
import {
  fetchClassApplicants,
  updateApplicantStatus,
} from "@/lib/api/enrollment";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, Loader2, RefreshCw, UserCheck, Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface ApplicantsTableProps {
  classId: string | number;
  onStatusChanged?: () => void;
}

export function ApplicantsTable({
  classId,
  onStatusChanged,
}: ApplicantsTableProps) {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");

  const loadApplicants = async () => {
    try {
      setIsLoading(true);
      const data = await fetchClassApplicants(classId);
      setApplicants(data);
    } catch (error) {
      console.error("Gagal memuat permohonan pendaftar:", error);
      toast.error("Gagal memuat data pendaftar");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      loadApplicants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const handleUpdateStatus = async (
    applicantId: number,
    newStatus: "APPROVED" | "REJECTED"
  ) => {
    try {
      setUpdatingId(applicantId);
      await updateApplicantStatus(applicantId, newStatus);
      toast.success(
        newStatus === "APPROVED"
          ? "Pendaftaran siswa berhasil disetujui"
          : "Pendaftaran siswa ditolak"
      );

      // Update local state
      setApplicants((prev) =>
        prev.map((app) =>
          app.id === applicantId ? { ...app, status: newStatus } : app
        )
      );

      onStatusChanged?.();
    } catch (error) {
      console.error("Gagal memperbarui status pendaftar:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui status pendaftar"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplicants = applicants.filter((app) => {
    if (filter === "ALL") return true;
    return app.status === filter;
  });

  const pendingCount = applicants.filter((a) => a.status === "PENDING").length;
  const approvedCount = applicants.filter((a) => a.status === "APPROVED").length;
  const rejectedCount = applicants.filter((a) => a.status === "REJECTED").length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserCheck className="h-5 w-5 text-primary" />
            Manajemen Pendaftaran Siswa
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {pendingCount} Menunggu
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Kelola persetujuan permohonan bergabung siswa untuk kelas ini.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadApplicants}
            disabled={isLoading}
            className="gap-1.5 h-8 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 border-b pb-3">
          <Button
            variant={filter === "ALL" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("ALL")}
            className="h-7 text-xs px-2.5 rounded-full"
          >
            Semua ({applicants.length})
          </Button>
          <Button
            variant={filter === "PENDING" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("PENDING")}
            className={`h-7 text-xs px-2.5 rounded-full ${
              filter !== "PENDING" && pendingCount > 0
                ? "border-amber-500/50 text-amber-600 dark:text-amber-400"
                : ""
            }`}
          >
            <Clock className="h-3 w-3 mr-1" />
            Menunggu ({pendingCount})
          </Button>
          <Button
            variant={filter === "APPROVED" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("APPROVED")}
            className="h-7 text-xs px-2.5 rounded-full"
          >
            <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" />
            Disetujui ({approvedCount})
          </Button>
          <Button
            variant={filter === "REJECTED" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("REJECTED")}
            className="h-7 text-xs px-2.5 rounded-full"
          >
            <XCircle className="h-3 w-3 mr-1 text-rose-500" />
            Ditolak ({rejectedCount})
          </Button>
        </div>

        {filteredApplicants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <UserCheck className="h-10 w-10 stroke-1 mb-2 text-muted-foreground/50" />
            <p className="font-medium text-sm">
              {filter === "PENDING"
                ? "Tidak ada permohonan yang sedang menunggu persetujuan."
                : "Belum ada data pendaftar pada filter ini."}
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[45px]">No</TableHead>
                  <TableHead>Siswa</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tanggal Pengajuan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplicants.map((applicant, index) => {
                  const isUpdating = updatingId === applicant.id;
                  const dateStr = applicant.createdAt
                    ? new Date(applicant.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-";

                  return (
                    <TableRow key={applicant.id}>
                      <TableCell className="font-medium text-xs text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={applicant.user?.profileImage}
                              alt={applicant.user?.name || "Siswa"}
                            />
                            <AvatarFallback className="text-xs">
                              {(applicant.user?.name || "S").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-xs leading-none">
                              {applicant.user?.name || "Tanpa Nama"}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              @{applicant.user?.username || "-"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {applicant.user?.email || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {dateStr}
                      </TableCell>
                      <TableCell>
                        {applicant.status === "PENDING" && (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[11px] gap-1"
                          >
                            <Clock className="h-3 w-3" />
                            Menunggu
                          </Badge>
                        )}
                        {applicant.status === "APPROVED" && (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[11px] gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Disetujui
                          </Badge>
                        )}
                        {applicant.status === "REJECTED" && (
                          <Badge
                            variant="outline"
                            className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 text-[11px] gap-1"
                          >
                            <XCircle className="h-3 w-3" />
                            Ditolak
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {applicant.status !== "APPROVED" && (
                            <Button
                              size="sm"
                              variant="default"
                              className="h-7 text-xs px-2.5 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() =>
                                handleUpdateStatus(applicant.id, "APPROVED")
                              }
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                              Setujui
                            </Button>
                          )}
                          {applicant.status !== "REJECTED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2.5 gap-1 text-rose-600 hover:bg-rose-500/10 border-rose-200 dark:border-rose-900"
                              onClick={() =>
                                handleUpdateStatus(applicant.id, "REJECTED")
                              }
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                              Tolak
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
