"use client";

import React, { useState } from "react";
import { Teacher } from "@/types/teacher";
import { deleteTeacher, updateTeacher } from "@/lib/api/teachers";
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
import { Edit, Trash2, Save, X, Loader2 } from "lucide-react";
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);

  React.useEffect(() => {
    if (teacher) {
      setCurrentTeacher(teacher);
      setEditForm(teacher);
    }
    setIsEditing(false);
  }, [teacher, isOpen]);

  if (!currentTeacher) return null;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
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

      setIsSaving(true);
      try {
        const updatedTeacher = await updateTeacher(currentTeacher.id, {
          name: editForm.fullName,
          username: editForm.username,
          email: editForm.email,
        });

        // Update local state to show new data
        setCurrentTeacher(updatedTeacher);
        setEditForm(updatedTeacher);

        onUpdate(updatedTeacher);
        toast.success("Data guru berhasil diperbarui");
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating teacher:", error);
        toast.error("Gagal memperbarui data guru. Silakan coba lagi.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleCancel = () => {
    setEditForm(currentTeacher);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus guru ini?")) {
      setIsDeleting(true);
      try {
        await deleteTeacher(currentTeacher.id);
        onDelete(currentTeacher.id);
        toast.success("Data guru berhasil dihapus");
        onClose();
      } catch (error) {
        console.error("Error deleting teacher:", error);
        toast.error("Gagal menghapus guru. Silakan coba lagi.");
      } finally {
        setIsDeleting(false);
      }
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
                      isEditing
                        ? editForm?.profilePhoto
                        : currentTeacher.profilePhoto
                    }
                    alt={
                      isEditing ? editForm?.fullName : currentTeacher.fullName
                    }
                  />
                  <AvatarFallback className="text-lg">
                    {(isEditing ? editForm?.fullName : currentTeacher.fullName)
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
                      {currentTeacher.fullName}
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
                      {currentTeacher.username}
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
                      {currentTeacher.email}
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
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? "Menyimpan..." : "Simpan"}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleDelete}
                variant="destructive"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                {isDeleting ? "Menghapus..." : "Hapus"}
              </Button>
              <Button onClick={handleEdit} disabled={isDeleting}>
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
