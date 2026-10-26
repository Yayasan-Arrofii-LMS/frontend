"use client";

import React from "react";
import { Class } from "@/types/class";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/optimized-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Kelas?</DialogTitle>
          <DialogDescription className="space-y-2">
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
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              "Hapus"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
