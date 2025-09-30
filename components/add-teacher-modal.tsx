"use client";

import React, { useState } from "react";
import { Teacher } from "@/types/teacher";
import { createTeacher } from "@/lib/api/teachers";
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
import { Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (teacher: Teacher) => void;
}

export function AddTeacherModal({
  isOpen,
  onClose,
  onAdd,
}: AddTeacherModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newTeacher = await createTeacher(formData);
      onAdd(newTeacher);
      toast.success("Guru baru berhasil ditambahkan");

      // Reset form
      setFormData({
        name: "",
        username: "",
        email: "",
      });

      onClose();
    } catch (error) {
      console.error("Error creating teacher:", error);
      toast.error("Gagal menambahkan guru. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: "",
      username: "",
      email: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Tambah Guru Baru</DialogTitle>
          <div className="text-sm text-muted-foreground text-center mt-2">
            <p>
              Password default akan diset otomatis. Guru dapat mengubah password
              setelah login pertama.
            </p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nama lengkap guru"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {isLoading ? "Menambah..." : "Tambah Guru"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
