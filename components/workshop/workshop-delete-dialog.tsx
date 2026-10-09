"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Workshop } from "@/types/workshop";
import { AlertTriangle } from "lucide-react";

interface WorkshopDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workshop: Workshop | null;
  onConfirm: () => void;
}

export function WorkshopDeleteDialog({
  open,
  onOpenChange,
  workshop,
  onConfirm,
}: WorkshopDeleteDialogProps) {
  if (!workshop) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Hapus Workshop
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span>
              Apakah Anda yakin ingin menghapus workshop{" "}
              <strong className="text-foreground">"{workshop.title}"</strong>?
            </span>
            <span className="block text-xs text-muted-foreground">
              Tindakan ini tidak dapat dibatalkan. Seluruh data peserta terdaftar ({workshop.registeredCount} peserta) juga akan dihapus.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Ya, Hapus Workshop
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
