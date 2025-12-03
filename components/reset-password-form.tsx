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
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/lib/api/auth";
import { toast } from "sonner";

export function ResetPasswordForm({
  ...props
}: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Get reset token from session storage
    const token = sessionStorage.getItem("reset_token");
    if (token) {
      setResetToken(token);
    } else {
      toast.error("Token reset tidak ditemukan. Silakan coba lagi.");
      router.push("/forgot-password");
    }
  }, [router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "Password wajib diisi";
    } else if (formData.newPassword.trim().length < 8) {
      newErrors.newPassword = "Password minimal 8 karakter";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Silakan konfirmasi password Anda";
    } else if (
      formData.newPassword.trim() !== formData.confirmPassword.trim()
    ) {
      newErrors.confirmPassword = "Password tidak cocok";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!resetToken) {
      toast.error("Token reset tidak ditemukan");
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPassword({
        reset_token: resetToken,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      if (response.success) {
        toast.success(response.message || "Reset password berhasil!");
        // Clear session storage
        sessionStorage.removeItem("reset_token");
        router.push("/login");
      } else {
        toast.error(response.message || "Gagal reset password");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal reset password"
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
        <CardTitle>Reset password Anda</CardTitle>
        <CardDescription>
          Masukkan password baru Anda untuk reset password akun.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="newPassword">Password Baru</FieldLabel>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {errors.newPassword ? (
                <FieldDescription className="text-red-500">
                  {errors.newPassword}
                </FieldDescription>
              ) : (
                <FieldDescription>
                  Minimal 8 karakter.
                </FieldDescription>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="confirmPassword">
                Konfirmasi Password Baru
              </FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {errors.confirmPassword ? (
                <FieldDescription className="text-red-500">
                  {errors.confirmPassword}
                </FieldDescription>
              ) : (
                <FieldDescription>
                  Silakan konfirmasi password baru Anda.
                </FieldDescription>
              )}
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Mereset..." : "Reset Password"}
                </Button>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
