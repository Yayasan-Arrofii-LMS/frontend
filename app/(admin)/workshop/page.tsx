"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWorkshops } from "@/hooks/use-workshops";
import { WorkshopFormModal } from "@/components/workshop/workshop-form-modal";
import { WorkshopDeleteDialog } from "@/components/workshop/workshop-delete-dialog";
import { WorkshopParticipantsModal } from "@/components/workshop/workshop-participants-modal";
import { Workshop, WorkshopFormData } from "@/types/workshop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Compass,
  Plus,
  Search,
  Users,
  Calendar,
  Edit,
  Trash2,
  Video,
  MapPin,
  Eye,
  Check,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { isWorkshopPast } from "@/lib/utils";

export default function AdminWorkshopPage() {
  const { user } = useAuth();
  const {
    workshops,
    isLoading,
    isSubmitting,
    createWorkshop,
    updateWorkshop,
    deleteWorkshop,
    approveWorkshop,
    rejectWorkshop,
    approveParticipant,
    rejectParticipant,
  } = useWorkshops();

  // Pulihkan posisi scroll terakhir ketika kembali dari halaman detail
  useEffect(() => {
    if (!isLoading && workshops.length > 0) {
      const savedPos = sessionStorage.getItem("admin_workshop_scroll_pos");
      if (savedPos !== null) {
        const scrollY = parseInt(savedPos, 10);
        if (!isNaN(scrollY)) {
          const timer = setTimeout(() => {
            window.scrollTo({ top: scrollY, behavior: "instant" });
            sessionStorage.removeItem("admin_workshop_scroll_pos");
          }, 60);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [isLoading, workshops.length]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [workshopToEdit, setWorkshopToEdit] = useState<Workshop | null>(null);
  const [workshopToDelete, setWorkshopToDelete] = useState<Workshop | null>(null);
  const [workshopToApprove, setWorkshopToApprove] = useState<Workshop | null>(null);
  const [workshopToReject, setWorkshopToReject] = useState<Workshop | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [workshopToViewParticipants, setWorkshopToViewParticipants] =
    useState<Workshop | null>(null);

  const pendingCount = workshops.filter(
    (w) => w.approvalStatus === "PENDING_APPROVAL"
  ).length;

  const tabFiltered = workshops.filter((w) => {
    if (selectedTab === "all") return true;
    return w.approvalStatus === selectedTab;
  });

  const filtered = tabFiltered.filter(
    (w) =>
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.instructorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRegistered = workshops.reduce((acc, w) => acc + w.registeredCount, 0);
  const totalQuota = workshops.reduce((acc, w) => acc + w.quota, 0);

  const handleCreate = () => {
    setWorkshopToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (ws: Workshop) => {
    setWorkshopToEdit(ws);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: WorkshopFormData) => {
    if (workshopToEdit) {
      const res = await updateWorkshop(workshopToEdit.id, data);
      if (res.success) {
        toast.success(res.message);
        setIsFormOpen(false);
      }
    } else {
      const res = await createWorkshop(data);
      if (res.success) {
        toast.success(res.message);
        setIsFormOpen(false);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (workshopToDelete) {
      const res = await deleteWorkshop(workshopToDelete.id);
      if (res.success) {
        toast.success(res.message);
        setWorkshopToDelete(null);
      }
    }
  };

  const handleConfirmApprove = async () => {
    if (!workshopToApprove) return;
    const res = await approveWorkshop(workshopToApprove.id);
    if (res.success) {
      toast.success(res.message);
      setWorkshopToApprove(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!workshopToReject) return;
    if (!rejectionReason.trim()) {
      toast.error("Alasan penolakan wajib diisi");
      return;
    }
    const res = await rejectWorkshop(workshopToReject.id, rejectionReason.trim());
    if (res.success) {
      toast.success(res.message);
      setWorkshopToReject(null);
      setRejectionReason("");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            Manajemen Workshop & Pelatihan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola persetujuan workshop guru, kuota, dan daftar pendaftar kegiatan Sekolah Alam.
          </p>
        </div>

        <Button onClick={handleCreate} className="gap-2 font-semibold shrink-0">
          <Plus className="h-4 w-4" />
          Tambah Workshop Baru
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Workshop
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workshops.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Program pembelajaran terdaftar
            </p>
          </CardContent>
        </Card>

        <Card className={pendingCount > 0 ? "border-amber-500/50 bg-amber-500/5" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              <span>Menunggu Persetujuan</span>
              {pendingCount > 0 && (
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px]">
                  Perlu Aksi
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${pendingCount > 0 ? "text-amber-600 dark:text-amber-400" : ""}`}>
              {pendingCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Diajukan oleh instruktur/guru
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Peserta Diterima
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {totalRegistered}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dari {totalQuota} total kursi tersedia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Okupansi Rata-rata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalQuota > 0 ? Math.round((totalRegistered / totalQuota) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Keterisian kuota workshop
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Search & Table */}
      <Card>
        <CardHeader className="pb-3 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-2 sm:flex sm:w-auto">
                <TabsTrigger value="all">
                  Semua ({workshops.length})
                </TabsTrigger>
                <TabsTrigger value="PENDING_APPROVAL" className="relative">
                  Menunggu
                  {pendingCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                      {pendingCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="APPROVED">
                  Disetujui ({workshops.filter((w) => w.approvalStatus === "APPROVED").length})
                </TabsTrigger>
                <TabsTrigger value="REJECTED">
                  Ditolak ({workshops.filter((w) => w.approvalStatus === "REJECTED").length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari workshop atau guru..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workshop</TableHead>
                  <TableHead>Kategori & Format</TableHead>
                  <TableHead>Status Publikasi</TableHead>
                  <TableHead>Pelaksanaan</TableHead>
                  <TableHead>Instruktur</TableHead>
                  <TableHead className="text-center">Peserta</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Tidak ada data workshop yang sesuai.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((ws) => (
                    <TableRow key={ws.id}>
                      <TableCell className="max-w-xs">
                        <div className="font-semibold line-clamp-1">{ws.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {ws.description}
                        </div>
                        {ws.approvalStatus === "REJECTED" && ws.rejectionReason && (
                          <div className="mt-1 flex items-start gap-1 text-[11px] text-rose-600 dark:text-rose-400 bg-rose-500/10 p-1.5 rounded">
                            <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">Alasan: {ws.rejectionReason}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          <Badge variant="secondary" className="text-[11px]">
                            {ws.category}
                          </Badge>
                          <Badge
                            variant={ws.type === "Online" ? "default" : "outline"}
                            className="text-[10px] flex items-center gap-1"
                          >
                            {ws.type === "Online" ? (
                              <>
                                <Video className="h-3 w-3 text-blue-400" /> Online
                              </>
                            ) : (
                              <>
                                <MapPin className="h-3 w-3 text-amber-500" /> Offline
                              </>
                            )}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {ws.approvalStatus === "APPROVED" ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium text-[11px] flex items-center gap-1 w-fit"
                          >
                            <CheckCircle2 className="h-3 w-3" /> Disetujui
                          </Badge>
                        ) : ws.approvalStatus === "PENDING_APPROVAL" ? (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium text-[11px] flex items-center gap-1 w-fit"
                          >
                            <Clock className="h-3 w-3" /> Menunggu
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-medium text-[11px] flex items-center gap-1 w-fit"
                          >
                            <XCircle className="h-3 w-3" /> Ditolak
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(ws.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-muted-foreground mt-0.5">
                          {ws.startTime} - {ws.endTime} WIB
                        </div>
                        <div className="mt-1">
                          {isWorkshopPast(ws.date, ws.endTime) ? (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground bg-muted border-muted-foreground/20">
                              Sudah Selesai
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-medium">
                              Akan Berjalan
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {ws.instructorName}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs font-bold gap-1 text-primary"
                          onClick={() => setWorkshopToViewParticipants(ws)}
                        >
                          <Users className="h-3.5 w-3.5" />
                          {ws.registeredCount} / {ws.quota}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Tombol Approval Khusus Pending */}
                          {ws.approvalStatus === "PENDING_APPROVAL" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                onClick={() => setWorkshopToApprove(ws)}
                                title="Setujui Workshop"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                onClick={() => {
                                  setWorkshopToReject(ws);
                                  setRejectionReason("");
                                }}
                                title="Tolak Workshop"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <Link
                              href={`/workshops/${ws.id}?from=workshop`}
                              title="Lihat Halaman Publik"
                              onClick={() => {
                                if (typeof window !== "undefined") {
                                  sessionStorage.setItem(
                                    "admin_workshop_scroll_pos",
                                    window.scrollY.toString()
                                  );
                                }
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(ws)}
                            title="Edit Workshop"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => setWorkshopToDelete(ws)}
                            title="Hapus Workshop"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <WorkshopFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        workshopToEdit={workshopToEdit}
        onSubmit={handleFormSubmit}
      />

      <WorkshopDeleteDialog
        open={!!workshopToDelete}
        onOpenChange={(open) => !open && setWorkshopToDelete(null)}
        workshop={workshopToDelete}
        onConfirm={handleConfirmDelete}
      />

      <WorkshopParticipantsModal
        open={!!workshopToViewParticipants}
        onOpenChange={(open) => !open && setWorkshopToViewParticipants(null)}
        workshop={workshopToViewParticipants}
        canManage={true}
        onApproveParticipant={approveParticipant}
        onRejectParticipant={rejectParticipant}
      />

      {/* Approve Confirmation Dialog */}
      <Dialog
        open={!!workshopToApprove}
        onOpenChange={(open) => !open && setWorkshopToApprove(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Setujui Publikasi Workshop
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menyetujui workshop ini? Workshop akan langsung dipublikasikan di katalog publik dan dapat didaftar oleh siswa.
            </DialogDescription>
          </DialogHeader>

          {workshopToApprove && (
            <div className="p-3 rounded-lg border bg-muted/40 space-y-1 text-sm">
              <div className="font-semibold text-foreground">
                {workshopToApprove.title}
              </div>
              <div className="text-xs text-muted-foreground">
                Instruktur: {workshopToApprove.instructorName} • Kategori: {workshopToApprove.category}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setWorkshopToApprove(null)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              onClick={handleConfirmApprove}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Memproses..." : "Ya, Setujui Workshop"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal Dialog */}
      <Dialog
        open={!!workshopToReject}
        onOpenChange={(open) => !open && setWorkshopToReject(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <XCircle className="h-5 w-5" />
              Tolak Publikasi Workshop
            </DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan agar pembuat workshop dapat melakukan perbaikan yang diperlukan.
            </DialogDescription>
          </DialogHeader>

          {workshopToReject && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg border bg-muted/40 space-y-1 text-sm">
                <div className="font-semibold text-foreground">
                  {workshopToReject.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  Instruktur: {workshopToReject.instructorName}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Alasan Penolakan <span className="text-destructive">*</span></label>
                <Textarea
                  placeholder="Tuliskan alasan penolakan atau revisi yang dibutuhkan..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setWorkshopToReject(null);
                setRejectionReason("");
              }}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={isSubmitting || !rejectionReason.trim()}
            >
              {isSubmitting ? "Memproses..." : "Tolak Workshop"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
