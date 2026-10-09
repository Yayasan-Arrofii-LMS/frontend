"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWorkshops } from "@/hooks/use-workshops";
import { WorkshopFormModal } from "@/components/workshop/workshop-form-modal";
import { WorkshopDeleteDialog } from "@/components/workshop/workshop-delete-dialog";
import { WorkshopParticipantsModal } from "@/components/workshop/workshop-participants-modal";
import { Workshop, WorkshopFormData } from "@/types/workshop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminWorkshopPage() {
  const { user } = useAuth();
  const {
    workshops,
    createWorkshop,
    updateWorkshop,
    deleteWorkshop,
  } = useWorkshops();

  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [workshopToEdit, setWorkshopToEdit] = useState<Workshop | null>(null);
  const [workshopToDelete, setWorkshopToDelete] = useState<Workshop | null>(null);
  const [workshopToViewParticipants, setWorkshopToViewParticipants] =
    useState<Workshop | null>(null);

  const filtered = workshops.filter(
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

  const handleFormSubmit = (data: WorkshopFormData) => {
    if (workshopToEdit) {
      updateWorkshop(workshopToEdit.id, data);
      toast.success("Workshop berhasil diperbarui!");
    } else {
      createWorkshop(data, {
        id: user?.id || "admin-1",
        name: user?.name || "Administrator",
        avatar: user?.profilePicture || null,
        bio: "Pengelola Workshop Sekolah Alam",
      });
      toast.success("Workshop baru berhasil dibuat!");
    }
  };

  const handleConfirmDelete = () => {
    if (workshopToDelete) {
      deleteWorkshop(workshopToDelete.id);
      toast.success("Workshop berhasil dihapus.");
      setWorkshopToDelete(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Compass className="h-7 w-7 text-primary" />
            Manajemen Workshop & Pelatihan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola program workshop, kuota peserta, dan daftar pendaftar seluruh kegiatan Sekolah Alam.
          </p>
        </div>

        <Button onClick={handleCreate} className="gap-2 font-semibold shrink-0">
          <Plus className="h-4 w-4" />
          Tambah Workshop Baru
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Workshop Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workshops.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Program pembelajaran & praktik
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Peserta Terdaftar
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

      {/* Search & Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <CardTitle className="text-lg">Daftar Workshop</CardTitle>
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
                  <TableHead>Pelaksanaan</TableHead>
                  <TableHead>Instruktur</TableHead>
                  <TableHead className="text-center">Peserta</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <Link href={`/workshops/${ws.id}`} title="Lihat Halaman Publik">
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
      />
    </div>
  );
}
