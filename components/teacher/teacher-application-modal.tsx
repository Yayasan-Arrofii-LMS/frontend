"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Send, Mail, Info } from "lucide-react";
import { toast } from "sonner";

interface TeacherApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  expertise: string;
  motivation: string;
}

const initialFormState: FormState = {
  name: "",
  email: "",
  phone: "",
  expertise: "",
  motivation: "",
};

const TARGET_EMAIL = "umartaufiq8284@ugm.ac.id";

export function TeacherApplicationModal({
  isOpen,
  onClose,
}: TeacherApplicationModalProps) {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};

    // 1. Nama Lengkap
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = "Nama lengkap wajib diisi.";
    } else if (trimmedName.length < 2) {
      newErrors.name = "Nama lengkap minimal 2 karakter.";
    }

    // 2. Email
    const trimmedEmail = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      newErrors.email = "Email wajib diisi.";
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = "Format email tidak valid. Gunakan format yang benar (contoh: nama@domain.com).";
    }

    // 3. Nomor Telepon/WhatsApp
    const trimmedPhone = formData.phone.trim();
    const phoneRegex = /^[0-9+\-\s()]{8,20}$/;
    const digitsOnly = trimmedPhone.replace(/\D/g, "");
    if (!trimmedPhone) {
      newErrors.phone = "Nomor telepon/WhatsApp wajib diisi.";
    } else if (!phoneRegex.test(trimmedPhone) || digitsOnly.length < 8 || digitsOnly.length > 16) {
      newErrors.phone = "Nomor telepon tidak valid. Masukkan 8-16 digit nomor telepon yang benar.";
    }

    // 4. Keahlian yang Akan Diajarkan
    const trimmedExpertise = formData.expertise.trim();
    if (!trimmedExpertise) {
      newErrors.expertise = "Keahlian yang akan diajarkan wajib diisi.";
    }

    // 5. Alasan Mengajukan Diri Menjadi Guru
    const trimmedMotivation = formData.motivation.trim();
    if (!trimmedMotivation) {
      newErrors.motivation = "Alasan mengajukan diri menjadi guru wajib diisi.";
    } else if (trimmedMotivation.length < 10) {
      newErrors.motivation = "Mohon jelaskan alasan Anda secara lebih detail (minimal 10 karakter).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Mohon lengkapi dan periksa kembali isian formulir.");
      return;
    }

    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const expertise = formData.expertise.trim();
    const motivation = formData.motivation.trim();

    const subject = `Pengajuan Menjadi Guru LMS Sekolah Alam - ${name}`;

    const body = `Yth. Admin LMS Sekolah Alam,

Saya bermaksud mengajukan diri untuk menjadi Guru pada LMS Sekolah Alam.

Berikut informasi diri saya:
Nama Lengkap: ${name}
Email: ${email}
Nomor Telepon/WhatsApp: ${phone}

Keahlian yang Akan Diajarkan:
${expertise}

Alasan Mengajukan Diri Menjadi Guru:
${motivation}

Saya berharap dapat diberikan kesempatan untuk berkontribusi sebagai Guru dalam kegiatan pembelajaran di Sekolah Alam.

Demikian pengajuan ini saya sampaikan. Terima kasih atas perhatian dan pertimbangannya.

Hormat saya,
${name}`;

    const mailtoUrl = `mailto:${TARGET_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    // Buka aplikasi email pengguna
    window.location.href = mailtoUrl;

    // Tampilkan informasi bahwa email client telah dibuka dan user harus menekan Send
    toast.info(
      "Aplikasi email telah dibuka. Silakan tekan tombol 'Kirim' (Send) pada aplikasi email Anda untuk benar-benar mengirimkan pengajuan.",
      {
        duration: 9000,
      }
    );

    // Reset form dan tutup dialog
    setFormData(initialFormState);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl">Formulir Pengajuan Menjadi Guru</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground pt-1.5">
            Lengkapi formulir berikut untuk mengajukan diri sebagai Guru di LMS Sekolah Alam.
            Pengajuan Anda akan dikirimkan kepada Admin untuk ditinjau.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2" noValidate>
          {/* Nama Lengkap */}
          <div className="space-y-1.5">
            <Label htmlFor="applicant-name" className="text-sm font-medium">
              Nama Lengkap <span className="text-destructive">*</span>
            </Label>
            <Input
              id="applicant-name"
              placeholder="Masukkan nama lengkap Anda"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              aria-invalid={!!errors.name}
              className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.name && (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="applicant-email" className="text-sm font-medium">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="applicant-email"
              type="email"
              placeholder="nama@contoh.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              aria-invalid={!!errors.email}
              className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.email && (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Nomor Telepon / WhatsApp */}
          <div className="space-y-1.5">
            <Label htmlFor="applicant-phone" className="text-sm font-medium">
              Nomor Telepon/WhatsApp <span className="text-destructive">*</span>
            </Label>
            <Input
              id="applicant-phone"
              type="tel"
              placeholder="Contoh: 081234567890 atau +6281234567890"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              aria-invalid={!!errors.phone}
              className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.phone && (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>

          {/* Keahlian yang Akan Diajarkan */}
          <div className="space-y-1.5">
            <Label htmlFor="applicant-expertise" className="text-sm font-medium">
              Keahlian yang Akan Diajarkan <span className="text-destructive">*</span>
            </Label>
            <Input
              id="applicant-expertise"
              placeholder="Contoh: Pertanian, Peternakan, Sains Alam, Kewirausahaan, atau Keterampilan Hidup"
              value={formData.expertise}
              onChange={(e) => handleInputChange("expertise", e.target.value)}
              aria-invalid={!!errors.expertise}
              className={errors.expertise ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.expertise && (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.expertise}</span>
              </p>
            )}
          </div>

          {/* Alasan Mengajukan Diri Menjadi Guru */}
          <div className="space-y-1.5">
            <Label htmlFor="applicant-motivation" className="text-sm font-medium">
              Alasan Mengajukan Diri Menjadi Guru <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="applicant-motivation"
              rows={4}
              placeholder="Jelaskan motivasi Anda, pengalaman yang relevan, dan kontribusi yang ingin Anda berikan sebagai Guru di LMS Sekolah Alam..."
              value={formData.motivation}
              onChange={(e) => handleInputChange("motivation", e.target.value)}
              aria-invalid={!!errors.motivation}
              className={errors.motivation ? "border-destructive focus-visible:ring-destructive resize-y min-h-[90px]" : "resize-y min-h-[90px]"}
            />
            {errors.motivation && (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errors.motivation}</span>
              </p>
            )}
          </div>

          {/* Notice info */}
          <div className="flex items-start gap-2.5 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
            <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span>
              Pengajuan ini akan dibuka di aplikasi email Anda ditujukan ke{" "}
              <strong className="text-foreground">{TARGET_EMAIL}</strong>. Pastikan Anda menekan tombol kirim di aplikasi email setelah form ini terbuka.
            </span>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto gap-2"
            >
              <Send className="h-4 w-4" />
              Kirim Pengajuan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
