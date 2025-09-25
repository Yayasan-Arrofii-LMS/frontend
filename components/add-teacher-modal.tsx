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
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (teacher: Omit<Teacher, "id">) => void;
}

export function AddTeacherModal({
  isOpen,
  onClose,
  onAdd,
}: AddTeacherModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const teacherData: Omit<Teacher, "id"> = {
      ...formData,
      // Add default values for required fields
      profilePhoto: "", // Default empty, teacher can add later
      phoneNumber: "",
      address: "",
      dateOfBirth: new Date().toISOString().split("T")[0],
      subjects: [],
      joinDate: new Date().toISOString().split("T")[0],
      status: "active",
    };

    onAdd(teacherData);
    toast.success("Guru baru berhasil ditambahkan");

    // Reset form
    setFormData({
      fullName: "",
      username: "",
      email: "",
    });

    onClose();
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      fullName: "",
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
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
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
            <Button type="button" onClick={handleClose} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Guru
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
