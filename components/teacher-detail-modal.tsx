"use client";

import React, { useState } from "react";
import { Teacher } from "@/types/teacher";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";

interface TeacherDetailModalProps {
  teacher: Teacher | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (teacher: Teacher) => void;
  onDelete: (teacherId: string) => void;
}

export function TeacherDetailModal({
  teacher,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: TeacherDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Teacher | null>(null);

  React.useEffect(() => {
    if (teacher) {
      setEditForm(teacher);
    }
    setIsEditing(false);
  }, [teacher, isOpen]);

  if (!teacher) return null;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editForm) {
      // Validasi field yang wajib diisi
      if (!editForm.fullName.trim()) {
        toast.error("Nama lengkap harus diisi");
        return;
      }
      if (!editForm.username.trim()) {
        toast.error("Username harus diisi");
        return;
      }
      if (!editForm.email.trim()) {
        toast.error("Email harus diisi");
        return;
      }

      onUpdate(editForm);
      toast.success("Data guru berhasil diperbarui");
      onClose(); // Tutup modal setelah simpan untuk UX yang lebih baik
    }
  };

  const handleCancel = () => {
    setEditForm(teacher);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus guru ini?")) {
      onDelete(teacher.id);
      toast.success("Data guru berhasil dihapus");
      onClose();
    }
  };

  const handleInputChange = (
    field: keyof Teacher,
    value: string | string[]
  ) => {
    if (editForm) {
      setEditForm({
        ...editForm,
        [field]: value,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isEditing ? "Edit Guru" : "Detail Guru"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile and Information Layout */}
          <div className="flex gap-6">
            {/* Profile Photo - Left Side */}
            <div className="flex-shrink-0">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={
                      isEditing ? editForm?.profilePhoto : teacher.profilePhoto
                    }
                    alt={isEditing ? editForm?.fullName : teacher.fullName}
                  />
                  <AvatarFallback className="text-lg">
                    {(isEditing ? editForm?.fullName : teacher.fullName)
                      ?.split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Personal Information - Right Side */}
            <div className="flex-1">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Nama Lengkap{" "}
                    {isEditing && <span className="text-red-500">*</span>}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      value={editForm?.fullName || ""}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      required
                      placeholder="Nama lengkap guru"
                    />
                  ) : (
                    <p className="text-sm border rounded-md px-3 py-2 bg-muted">
                      {teacher.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">
                    Username{" "}
                    {isEditing && <span className="text-red-500">*</span>}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="username"
                      value={editForm?.username || ""}
                      onChange={(e) =>
                        handleInputChange("username", e.target.value)
                      }
                      required
                      placeholder="username"
                    />
                  ) : (
                    <p className="text-sm border rounded-md px-3 py-2 bg-muted">
                      {teacher.username}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email {isEditing && <span className="text-red-500">*</span>}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editForm?.email || ""}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                      placeholder="email@example.com"
                    />
                  ) : (
                    <p className="text-sm border rounded-md px-3 py-2 bg-muted">
                      {teacher.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleCancel} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Simpan
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleDelete} variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </Button>
              <Button onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
