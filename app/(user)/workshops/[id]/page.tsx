"use client";

import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useWorkshops } from "@/hooks/use-workshops";
import { WorkshopFormModal } from "@/components/workshop/workshop-form-modal";
import { WorkshopDeleteDialog } from "@/components/workshop/workshop-delete-dialog";
import { WorkshopParticipantsModal } from "@/components/workshop/workshop-participants-modal";
import { WorkshopFormData } from "@/types/workshop";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit,
  Trash2,
  Share2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function WorkshopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const workshopId = resolvedParams.id;

  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const {
    getWorkshop,
    updateWorkshop,
    deleteWorkshop,
    registerWorkshop,
    cancelRegistration,
  } = useWorkshops();

  const workshop = getWorkshop(workshopId);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  if (!workshop) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
        <AlertCircle className="h-14 w-14 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Workshop Tidak Ditemukan</h1>
        <p className="text-muted-foreground mb-6">
          Workshop yang Anda cari mungkin telah dihapus atau tidak tersedia.
        </p>
        <Button asChild>
          <Link href="/workshops">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Daftar Workshop
          </Link>
        </Button>
      </div>
    );
  }

  const isTeacherOrAdmin =
    isAuthenticated &&
    (user?.role?.toLowerCase() === "teacher" ||
      user?.role?.toLowerCase() === "admin" ||
      user?.role?.toLowerCase() === "superadmin");

  const isRegistered =
    !!user &&
    workshop.participants.some(
      (p) => p.userId === user.id && p.status === "Terdaftar"
    );

  const isFull = workshop.registeredCount >= workshop.quota;
  const remainingQuota = Math.max(0, workshop.quota - workshop.registeredCount);
  const quotaPercent = Math.min(
    100,
    Math.round((workshop.registeredCount / workshop.quota) * 100)
  );

  const formattedDate = new Date(workshop.date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleRegister = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    if (!user) return;

    const res = registerWorkshop(workshop.id, {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.profilePicture,
    });

    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleConfirmCancel = () => {
    if (!user) return;
    const res = cancelRegistration(workshop.id, user.id);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
    setIsCancelConfirmOpen(false);
  };

  const handleFormSubmit = (data: WorkshopFormData) => {
    updateWorkshop(workshop.id, data);
    toast.success("Workshop berhasil diperbarui!");
  };

  const handleConfirmDelete = () => {
    deleteWorkshop(workshop.id);
    toast.success("Workshop berhasil dihapus.");
    router.push("/workshops");
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      toast.success("Tautan workshop disalin ke clipboard!");
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-7xl">
      {/* Top Back & Admin Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href="/workshops">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Katalog Workshop
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5">
            <Share2 className="h-4 w-4" />
            Bagikan
          </Button>

          {isTeacherOrAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsParticipantsModalOpen(true)}
                className="gap-1.5"
              >
                <Users className="h-4 w-4" />
                Daftar Peserta ({workshop.registeredCount})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFormOpen(true)}
                className="gap-1.5"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                Hapus
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Banner Thumbnail */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border bg-muted shadow-sm">
            <Image
              src={workshop.thumbnail || "/placeholder.svg"}
              alt={workshop.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className="bg-background/90 text-foreground backdrop-blur-md text-xs font-semibold">
                {workshop.category}
              </Badge>
              <Badge
                variant={workshop.type === "Online" ? "default" : "outline"}
                className={
                  workshop.type === "Online"
                    ? "bg-blue-600 text-white"
                    : "bg-background/90 text-foreground"
                }
              >
                {workshop.type === "Online" ? "Online Meeting" : "Offline Praktik Lapangan"}
              </Badge>
            </div>
          </div>

          {/* Title and Intro */}
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              {workshop.title}
            </h1>
            {isRegistered && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                Anda telah terdaftar sebagai peserta pada workshop ini
              </div>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Deskripsi & Rincian Kegiatan
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground whitespace-pre-line leading-relaxed text-sm sm:text-base">
              {workshop.description}
            </div>
          </div>

          <Separator />

          {/* Instructor Bio */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Narasumber / Instruktur
            </h2>
            <Card className="p-4 bg-muted/30 border-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-primary/20">
                  <AvatarImage src={workshop.instructorAvatar || undefined} />
                  <AvatarFallback className="font-bold">
                    {workshop.instructorName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {workshop.instructorName}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {workshop.instructorBio || "Pengajar & Praktisi Alam"}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Sidebar Information & Action Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="sticky top-20 border-2 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">
                Informasi Pelaksanaan
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Date & Time */}
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-foreground">
                      Tanggal
                    </span>
                    <span className="text-muted-foreground">{formattedDate}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-foreground">
                      Waktu
                    </span>
                    <span className="text-muted-foreground">
                      {workshop.startTime} - {workshop.endTime} WIB
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {workshop.type === "Online" ? (
                    <Video className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  ) : (
                    <MapPin className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold block text-foreground">
                      Format Kegiatan
                    </span>
                    <span className="text-muted-foreground">
                      {workshop.type === "Online"
                        ? "Daring (Online Meeting)"
                        : "Luring (Praktik Lapangan)"}
                    </span>
                    {workshop.type === "Offline" && workshop.location && (
                      <p className="text-xs text-foreground mt-1 font-medium bg-muted/60 p-2 rounded-md">
                        📍 {workshop.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Online Meeting Link (Shown if user is registered or admin) */}
              {workshop.type === "Online" && workshop.meetingLink && (
                <div className="p-3.5 rounded-xl border bg-blue-500/5 border-blue-500/20 space-y-1.5">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400 block">
                    Ruang Virtual (Link Meeting)
                  </span>
                  {isRegistered || isTeacherOrAdmin ? (
                    <a
                      href={workshop.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 underline font-semibold hover:text-blue-700"
                    >
                      Buka Ruang Zoom / Meet
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      Link meeting akan dapat diakses setelah Anda berhasil terdaftar.
                    </p>
                  )}
                </div>
              )}

              <Separator />

              {/* Quota Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Status Kuota:</span>
                  <span className="font-bold">
                    {workshop.registeredCount} / {workshop.quota} Peserta
                  </span>
                </div>
                <Progress
                  value={quotaPercent}
                  className={`h-2.5 ${isFull ? "[&>div]:bg-red-500" : ""}`}
                />
                <div className="flex justify-between items-center text-xs">
                  {isFull ? (
                    <span className="text-red-500 font-semibold flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Kuota Penuh
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Tersisa {remainingQuota} kursi lagi
                    </span>
                  )}
                  <span className="text-muted-foreground">{quotaPercent}%</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                {isRegistered ? (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 font-semibold"
                      disabled
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Anda Sudah Terdaftar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCancelConfirmOpen(true)}
                      className="w-full text-xs text-muted-foreground hover:text-destructive"
                    >
                      Batalkan Pendaftaran
                    </Button>
                  </div>
                ) : isFull ? (
                  <Button
                    disabled
                    size="lg"
                    className="w-full font-bold cursor-not-allowed opacity-60"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Kuota Penuh
                  </Button>
                ) : (
                  <Button
                    onClick={handleRegister}
                    size="lg"
                    className="w-full font-bold shadow-md"
                  >
                    Daftar Workshop Sekarang
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Login Prompt Dialog */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Diperlukan</DialogTitle>
            <DialogDescription>
              Anda harus masuk menggunakan akun Anda terlebih dahulu untuk mendaftar workshop ini.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button variant="outline" onClick={() => setShowLoginPrompt(false)}>
              Batal
            </Button>
            <Button onClick={() => router.push("/login")}>
              Masuk Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Registration Dialog */}
      <Dialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batalkan Pendaftaran</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin membatalkan keikutsertaan dalam workshop ini? Kuota kursi Anda akan diberikan kepada peserta lain.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button
              variant="outline"
              onClick={() => setIsCancelConfirmOpen(false)}
            >
              Kembali
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
            >
              Ya, Batalkan Pendaftaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Modals */}
      <WorkshopFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        workshopToEdit={workshop}
        onSubmit={handleFormSubmit}
      />

      <WorkshopDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        workshop={workshop}
        onConfirm={handleConfirmDelete}
      />

      <WorkshopParticipantsModal
        open={isParticipantsModalOpen}
        onOpenChange={setIsParticipantsModalOpen}
        workshop={workshop}
      />
    </div>
  );
}
