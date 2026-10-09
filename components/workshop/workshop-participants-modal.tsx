"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { Workshop } from "@/types/workshop";
import { Users, Search, CheckCircle2, XCircle, Calendar } from "lucide-react";

interface WorkshopParticipantsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workshop: Workshop | null;
}

export function WorkshopParticipantsModal({
  open,
  onOpenChange,
  workshop,
}: WorkshopParticipantsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  if (!workshop) return null;

  const participants = workshop.participants || [];
  const filteredParticipants = participants.filter(
    (p) =>
      p.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = participants.filter((p) => p.status === "Terdaftar").length;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Daftar Peserta Workshop
          </DialogTitle>
          <DialogDescription className="line-clamp-1">
            {workshop.title} • ({activeCount}/{workshop.quota} Peserta Terdaftar)
          </DialogDescription>
        </DialogHeader>

        {/* Search & Filter */}
        <div className="py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau email peserta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto border rounded-md">
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">
                {searchQuery
                  ? "Tidak ada peserta yang cocok dengan pencarian"
                  : "Belum ada peserta yang mendaftar ke workshop ini"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">No</TableHead>
                  <TableHead>Peserta</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tanggal Daftar</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.map((participant, index) => (
                  <TableRow key={participant.id}>
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.userAvatar || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(participant.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm">
                          {participant.userName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {participant.userEmail}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
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
                      <Badge
                        variant={
                          participant.status === "Terdaftar"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          participant.status === "Terdaftar"
                            ? "bg-emerald-600 hover:bg-emerald-600 text-xs"
                            : "text-xs"
                        }
                      >
                        {participant.status === "Terdaftar" ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Terdaftar
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> Dibatalkan
                          </span>
                        )}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
