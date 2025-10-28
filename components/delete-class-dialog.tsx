"use client";

import React from "react";
import { Class } from "@/types/class";
import { deleteClass } from "@/lib/api/classes";
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  classData: Class | null;
  isLoading: boolean;
}

export function DeleteClassDialog({
  isOpen,
  onClose,
  onDelete,
  classData,
  isLoading,
}: DeleteClassDialogProps) {
  if (!classData) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Kelas?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              Anda yakin ingin menghapus kelas{" "}
              <span className="font-semibold text-foreground">
                &quot;{classData.title}&quot;
              </span>
              ?
            </span>
            <span className="block text-destructive">
              Tindakan ini tidak dapat dibatalkan. Semua data yang terkait
              dengan kelas ini akan dihapus permanen.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              "Hapus"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
