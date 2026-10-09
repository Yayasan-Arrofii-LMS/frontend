"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Workshop } from "@/types/workshop";

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
  const quotaPercent = Math.min(
    100,
    Math.round((workshop.registeredCount / workshop.quota) * 100)
  );

  const formattedDate = new Date(workshop.date).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg h-full flex flex-col justify-between group border-2 hover:border-primary/30">
      <div>
        {/* Thumbnail with overlay badges */}
        <div className="aspect-video w-full overflow-hidden bg-muted relative">
          <Image
            src={workshop.thumbnail || "/placeholder.svg"}
            alt={workshop.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <Badge variant="secondary" className="backdrop-blur-md bg-background/80 font-medium text-xs">
              {workshop.category}
            </Badge>
            <Badge
              variant={workshop.type === "Online" ? "default" : "outline"}
              className={`backdrop-blur-md text-xs font-semibold flex items-center gap-1 ${
                workshop.type === "Online"
                  ? "bg-blue-600/90 text-white hover:bg-blue-600"
                  : "bg-background/90 text-foreground border-foreground/20"
              }`}
            >
              {workshop.type === "Online" ? (
                <>
                  <Video className="h-3 w-3" />
                  Online
                </>
              ) : (
                <>
                  <MapPin className="h-3 w-3" />
                  Offline
                </>
              )}
            </Badge>
          </div>

          {isRegistered && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1 shadow-md">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Terdaftar
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-lg font-bold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            <Link href={`/workshops/${workshop.id}`}>{workshop.title}</Link>
          </CardTitle>
          <CardDescription className="line-clamp-2 text-xs sm:text-sm mt-1">
            {workshop.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 pt-1 space-y-3">
          {/* Date and Time */}
          <div className="space-y-1.5 text-xs text-muted-foreground pt-1 border-t">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>
                {workshop.startTime} - {workshop.endTime} WIB
              </span>
            </div>
            <div className="flex items-center gap-2 truncate">
              {workshop.type === "Online" ? (
                <>
                  <Video className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span className="truncate text-blue-600 dark:text-blue-400 font-medium">
                    Platform Online / Virtual Room
                  </span>
                </>
              ) : (
                <>
                  <MapPin className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span className="truncate" title={workshop.location}>
                    {workshop.location || "Lokasi menyusul"}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Instructor */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">Instruktur: <strong className="text-foreground">{workshop.instructorName}</strong></span>
          </div>

          {/* Quota Progress */}
          <div className="space-y-1.5 pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Kuota Peserta:</span>
              <span className="font-semibold">
                {workshop.registeredCount} / {workshop.quota}
              </span>
            </div>
            <Progress
              value={quotaPercent}
              className={`h-2 ${isFull ? "[&>div]:bg-red-500" : ""}`}
            />
            <div className="flex justify-between items-center text-[11px]">
              {isFull ? (
                <span className="text-red-500 font-semibold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Kuota Penuh
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Tersisa {remainingQuota} kursi
                </span>
              )}
              <span className="text-muted-foreground">{quotaPercent}% terisi</span>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Footer Actions */}
      <div className="p-4 pt-0 border-t mt-3 bg-muted/20">
        {showAdminActions ? (
          <div className="grid grid-cols-3 gap-2 pt-3">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => onParticipantsClick?.(workshop)}
            >
              Peserta ({workshop.registeredCount})
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => onEditClick?.(workshop)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="text-xs"
              onClick={() => onDeleteClick?.(workshop)}
            >
              Hapus
            </Button>
          </div>
        ) : (
          <div className="pt-3 flex gap-2">
            <Button asChild variant="outline" className="w-full text-xs font-semibold" size="sm">
              <Link href={`/workshops/${workshop.id}`}>
                Lihat Detail
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
