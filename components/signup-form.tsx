"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api/auth";
import { toast } from "sonner";

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama wajib diisi";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username wajib diisi";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.trim().length < 8) {
      newErrors.password = "Password minimal 8 karakter";
    }

    if (!formData.passwordConfirmation.trim()) {
      newErrors.passwordConfirmation = "Silakan konfirmasi password Anda";
    } else if (
      formData.password.trim() !== formData.passwordConfirmation.trim()
    ) {
      newErrors.passwordConfirmation = "Password tidak cocok";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await register(formData);

      if (response.success) {
        toast.success(response.message || "Registrasi berhasil!");
        // Store email untuk OTP verification
        sessionStorage.setItem("verification_email", formData.email);
        sessionStorage.setItem("otp_sent", "true");
        router.push("/otp");
      } else {
        toast.error(response.message || "Registrasi gagal");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Registrasi gagal"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Buat akun</CardTitle>
        <CardDescription>
          Masukkan informasi Anda untuk membuat akun
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nama Lengkap</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="Sekolah Alam"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {errors.name && (
                <FieldDescription className="text-red-500">
                  {errors.name}
                </FieldDescription>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                type="text"
                placeholder="sekolahalam"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {errors.username && (
                <FieldDescription className="text-red-500">
                  {errors.username}
                </FieldDescription>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="sekolah@alam.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {errors.email ? (
                <FieldDescription className="text-red-500">
                  {errors.email}
                </FieldDescription>
              ) : (
                <FieldDescription>
                  Kami akan menggunakan ini untuk menghubungi Anda. Kami tidak akan membagikan email Anda.
                </FieldDescription>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {errors.password ? (
                <FieldDescription className="text-red-500">
                  {errors.password}
                </FieldDescription>
              ) : (
                <FieldDescription>
                  Minimal 8 karakter.
                </FieldDescription>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="passwordConfirmation">
                Konfirmasi Password
              </FieldLabel>
              <Input
                id="passwordConfirmation"
                type="password"
                value={formData.passwordConfirmation}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {errors.passwordConfirmation ? (
                <FieldDescription className="text-red-500">
                  {errors.passwordConfirmation}
                </FieldDescription>
              ) : (
                <FieldDescription>
                  Silakan konfirmasi password Anda.
                </FieldDescription>
              )}
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Membuat Akun..." : "Buat Akun"}
                </Button>
                <Button 
                  variant="outline" 
                  type="button" 
                  disabled={true}
                  className="opacity-50 cursor-not-allowed"
                >
                  Daftar dengan Google
                </Button>
                <FieldDescription className="px-6 text-center">
                  Sudah punya akun? <Link href="/login">Masuk</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
