"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Video,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Workshop } from "@/types/workshop";
import { normalizeImageUrl } from "@/lib/utils";

interface WorkshopCardProps {
  workshop: Workshop;
  isRegistered?: boolean;
  onRegisterClick?: (workshop: Workshop) => void;
  showAdminActions?: boolean;
  onEditClick?: (workshop: Workshop) => void;
  onDeleteClick?: (workshop: Workshop) => void;
  onParticipantsClick?: (workshop: Workshop) => void;
}

export function WorkshopCard({
  workshop,
  isRegistered = false,
  showAdminActions = false,
  onEditClick,
  onDeleteClick,
  onParticipantsClick,
}: WorkshopCardProps) {
  const isFull = workshop.registeredCount >= workshop.quota;
  const remainingQuota = Math.max(0, workshop.quota - workshop.registeredCount);

  // Format tanggal ringkas (contoh: 29 Okt)
  const formattedDate = new Date(workshop.date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });

  const [imgSrc, setImgSrc] = useState<string>(
    normalizeImageUrl(workshop.thumbnail)
  );

  useEffect(() => {
    setImgSrc(normalizeImageUrl(workshop.thumbnail));
  }, [workshop.thumbnail]);

  return (
    <Card className="group flex flex-col justify-between overflow-hidden rounded-[var(--radius-xl)] border border-border bg-card text-card-foreground p-3.5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-primary/40 hover:shadow-md">
      <div>
        {/* Floating Thumbnail dengan aspect ratio terstandarisasi */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-lg)] bg-muted">
          <Image
            src={imgSrc}
            alt={workshop.title}
            fill
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImgSrc("/placeholder.svg")}
            unoptimized={!imgSrc.startsWith("/") && !imgSrc.includes("images.unsplash.com")}
          />

          {/* Badges di atas gambar */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
            <Badge
              variant="secondary"
              className="rounded-[var(--radius-sm)] bg-background/80 backdrop-blur-md px-2 py-0.5 text-[11px] font-medium text-foreground shadow-xs border-0"
            >
              {workshop.category}
            </Badge>

            <Badge
              variant="secondary"
              className="rounded-[var(--radius-sm)] bg-background/80 backdrop-blur-md px-2 py-0.5 text-[11px] font-medium text-foreground shadow-xs border-0 flex items-center gap-1"
            >
              {workshop.type === "Online" ? (
                <>
                  <Video className="h-3 w-3 text-primary shrink-0" strokeWidth={2} />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <MapPin className="h-3 w-3 text-amber-500 shrink-0" strokeWidth={2} />
                  <span>Offline</span>
                </>
              )}
            </Badge>
          </div>

          {/* Status Terdaftar */}
          {isRegistered && (
            <div className="absolute top-2.5 right-2.5 z-10">
              <span className="flex items-center gap-1 rounded-[var(--radius-sm)] bg-primary/95 text-primary-foreground backdrop-blur-md px-2 py-0.5 text-[11px] font-medium shadow-xs">
                <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
                Terdaftar
              </span>
            </div>
          )}
        </div>

        {/* Header & Deskripsi Kursus */}
        <div className="pt-3 pb-2 px-0.5">
          <h3 className="text-sm sm:text-base font-bold text-foreground line-clamp-1 leading-snug transition-colors duration-200 group-hover:text-primary">
            <Link href={`/workshops/${workshop.id}`} className="focus-visible:outline-hidden focus-visible:underline">
              {workshop.title}
            </Link>
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
            Fasilitator: <span className="font-medium text-foreground/90">{workshop.instructorName}</span>
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {workshop.description}
          </p>
        </div>
      </div>

      {/* Bagian Bawah: Tata Letak 3 Kolom Metrik Ringkas + Tombol Aksi */}
      <div className="mt-2.5 pt-3 border-t border-border flex items-center justify-between gap-2 px-0.5">
        {/* Ringkasan Metrik Horizontal */}
        <div className="grid grid-cols-3 gap-2.5 text-left min-w-0">
          <div className="truncate">
            <div className="text-xs font-semibold text-foreground truncate">{formattedDate}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Jadwal</div>
          </div>

          <div className="truncate">
            <div className="text-xs font-semibold text-foreground truncate">{workshop.startTime}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Mulai</div>
          </div>

          <div className="truncate">
            <div
              className={`text-xs font-semibold truncate ${isFull ? "text-destructive font-bold" : "text-foreground"
                }`}
            >
              {isFull ? "Penuh" : `${remainingQuota} Kursi`}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Sisa</div>
          </div>
        </div>

        {/* Tombol Aksi */}
        {showAdminActions ? (
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-[var(--radius-md)] px-2 text-xs"
              onClick={() => onParticipantsClick?.(workshop)}
              title="Daftar Peserta"
            >
              <Users className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.8} />
              <span className="hidden sm:inline ml-1 font-medium">{workshop.registeredCount}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-[var(--radius-md)] px-2.5 text-xs"
              onClick={() => onEditClick?.(workshop)}
              title="Edit Data"
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={1.8} />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-8 rounded-[var(--radius-md)] px-2.5 text-xs"
              onClick={() => onDeleteClick?.(workshop)}
              title="Hapus Workshop"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
            </Button>
          </div>
        ) : (
          <Button
            asChild
            size="sm"
            className="h-8 shrink-0 rounded-[var(--radius-md)] bg-primary text-primary-foreground hover:bg-primary/90 px-3.5 text-xs font-semibold shadow-xs"
          >
            <Link href={`/workshops/${workshop.id}`} className="flex items-center gap-1.5">
              Detail
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
          </Button>
        )}
      </div>
    </Card>
  );
}