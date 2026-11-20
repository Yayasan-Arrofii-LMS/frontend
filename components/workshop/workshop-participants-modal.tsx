"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Workshop, Participant } from "@/types/workshop";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Check,
  X,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface WorkshopParticipantsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workshop: Workshop | null;
  canManage?: boolean;
  onApproveParticipant?: (workshopId: string, participantId: string) => Promise<{ success: boolean; message: string }>;
  onRejectParticipant?: (workshopId: string, participantId: string, reason?: string) => Promise<{ success: boolean; message: string }>;
}

export function WorkshopParticipantsModal({
  open,
  onOpenChange,
  workshop,
  canManage = false,
  onApproveParticipant,
  onRejectParticipant,
}: WorkshopParticipantsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Reject modal state
  const [rejectParticipantTarget, setRejectParticipantTarget] = useState<Participant | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  if (!workshop) return null;

  const participants = workshop.participants || [];

  const pendingCount = participants.filter((p) => p.status === "PENDING_APPROVAL").length;
  const approvedCount = participants.filter(
    (p) => p.status === "APPROVED" || p.status === "Terdaftar"
  ).length;
  const rejectedCount = participants.filter((p) => p.status === "REJECTED").length;

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.userEmail.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "PENDING") {
      return p.status === "PENDING_APPROVAL";
    }
    if (statusFilter === "APPROVED") {
      return p.status === "APPROVED" || p.status === "Terdaftar";
    }
    if (statusFilter === "REJECTED") {
      return p.status === "REJECTED";
    }
    return true;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleApprove = async (participant: Participant) => {
    if (!onApproveParticipant) return;
    setProcessingId(participant.id);
    try {
      const res = await onApproveParticipant(workshop.id, participant.id);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenRejectModal = (participant: Participant) => {
    setRejectParticipantTarget(participant);
    setRejectionReason("");
  };

  const handleConfirmReject = async () => {
    if (!rejectParticipantTarget || !onRejectParticipant) return;
    setIsRejecting(true);
    try {
      const res = await onRejectParticipant(
        workshop.id,
        rejectParticipantTarget.id,
        rejectionReason.trim() || undefined
      );
      if (res.success) {
        toast.success(res.message);
        setRejectParticipantTarget(null);
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[88vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Kelola Pendaftar & Peserta Workshop
            </DialogTitle>
            <DialogDescription className="line-clamp-1">
              {workshop.title} • ({approvedCount}/{workshop.quota} Peserta Disetujui)
              {pendingCount > 0 && ` • ${pendingCount} Menunggu Persetujuan`}
            </DialogDescription>
          </DialogHeader>

          {/* Search & Tabs Filter */}
          <div className="py-2 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <Tabs
                value={statusFilter}
                onValueChange={setStatusFilter}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid grid-cols-4 w-full sm:w-auto h-9">
                  <TabsTrigger value="ALL" className="text-xs">
                    Semua ({participants.length})
                  </TabsTrigger>
                  <TabsTrigger value="PENDING" className="text-xs text-amber-600 dark:text-amber-400">
                    Menunggu ({pendingCount})
                  </TabsTrigger>
                  <TabsTrigger value="APPROVED" className="text-xs text-emerald-600 dark:text-emerald-400">
                    Diterima ({approvedCount})
                  </TabsTrigger>
                  <TabsTrigger value="REJECTED" className="text-xs text-destructive">
                    Ditolak ({rejectedCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama atau email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-y-auto border rounded-xl">
            {filteredParticipants.length === 0 ? (
              <div className="text-center py-14 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">
                  {searchQuery
                    ? "Tidak ada pendaftar yang cocok dengan pencarian"
                    : statusFilter === "PENDING"
                    ? "Tidak ada pendaftar yang sedang menunggu persetujuan"
                    : "Belum ada data pendaftar pada kategori ini"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">No</TableHead>
                    <TableHead>Pendaftar</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Waktu Pengajuan</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    {canManage && <TableHead className="text-center w-32">Aksi</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.map((participant, index) => {
                    const isPending = participant.status === "PENDING_APPROVAL";
                    const isApproved =
                      participant.status === "APPROVED" || participant.status === "Terdaftar";
                    const isRejected = participant.status === "REJECTED";
                    const isProcessing = processingId === participant.id;

                    return (
                      <TableRow key={participant.id} className="hover:bg-muted/40">
                        <TableCell className="text-center text-xs text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarImage src={participant.userAvatar || undefined} />
                              <AvatarFallback className="text-xs font-semibold">
                                {getInitials(participant.userName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <span className="font-semibold text-sm block truncate">
                                {participant.userName}
                              </span>
                              {participant.notes && (
                                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate max-w-xs">
                                  <FileText className="h-3 w-3 shrink-0" />
                                  <span>Catatan: {participant.notes}</span>
                                </p>
                              )}
                              {isRejected && participant.rejectionReason && (
                                <p className="text-[11px] text-destructive flex items-center gap-1 mt-0.5 truncate max-w-xs">
                                  <AlertTriangle className="h-3 w-3 shrink-0" />
                                  <span>Alasan: {participant.rejectionReason}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {participant.userEmail}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {new Date(participant.registrationDate).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {isPending && (
                            <Badge
                              variant="outline"
                              className="border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/40 text-[11px] font-medium"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Menunggu
                            </Badge>
                          )}
                          {isApproved && (
                            <Badge
                              variant="outline"
                              className="border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-[11px] font-medium"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Diterima
                            </Badge>
                          )}
                          {isRejected && (
                            <Badge
                              variant="outline"
                              className="border-destructive/60 text-destructive bg-destructive/5 text-[11px] font-medium"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Ditolak
                            </Badge>
                          )}
                          {participant.status === "CANCELLED" && (
                            <Badge variant="secondary" className="text-[11px] font-medium text-muted-foreground">
                              Dibatalkan
                            </Badge>
                          )}
                        </TableCell>

                        {/* Aksi Persetujuan untuk Guru / Admin */}
                        {canManage && (
                          <TableCell className="text-center">
                            {isPending ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 border-emerald-500 text-emerald-600 hover:bg-emerald-600 hover:text-white text-xs"
                                  onClick={() => handleApprove(participant)}
                                  disabled={isProcessing}
                                  title="Setujui Peserta"
                                >
                                  <Check className="h-3.5 w-3.5 mr-1" />
                                  Terima
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-white text-xs"
                                  onClick={() => handleOpenRejectModal(participant)}
                                  disabled={isProcessing}
                                  title="Tolak Peserta"
                                >
                                  <X className="h-3.5 w-3.5 mr-1" />
                                  Tolak
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted-foreground italic">
                                Selesai
                              </span>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Dialog Input Alasan Penolakan Peserta */}
      <Dialog
        open={!!rejectParticipantTarget}
        onOpenChange={(isOpen) => {
          if (!isOpen) setRejectParticipantTarget(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Tolak Pendaftaran Peserta
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menolak pendaftaran dari{" "}
              <strong>{rejectParticipantTarget?.userName}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-3">
            <label className="text-xs font-semibold text-foreground">
              Alasan Penolakan <span className="text-muted-foreground">(Opsional)</span>:
            </label>
            <Textarea
              placeholder="Misal: Kuota telah terpenuhi atau syarat belum lengkap..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setRejectParticipantTarget(null)}
              disabled={isRejecting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={isRejecting}
            >
              {isRejecting ? "Menolak..." : "Konfirmasi Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
