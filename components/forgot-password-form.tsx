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
import { forgotPassword } from "@/lib/api/auth";
import { toast } from "sonner";

export function ForgotPasswordForm({
  ...props
}: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return "Email wajib diisi";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Format email tidak valid";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await forgotPassword(email);

      if (response.success) {
        toast.success(response.message || "OTP reset password berhasil dikirim!");
        // Store email for OTP verification
        sessionStorage.setItem("verification_email", email);
        router.push("/otp?flow=forgot-password");
      } else {
        toast.error(response.message || "Gagal mengirim OTP reset");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mengirim OTP reset"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError("");
    }
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Lupa password?</CardTitle>
        <CardDescription>
          Masukkan alamat email Anda dan kami akan mengirimkan kode verifikasi
          untuk reset password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="sekolah@alam.com"
                value={email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {error && (
                <FieldDescription className="text-red-500">
                  {error}
                </FieldDescription>
              )}
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Mengirim..." : "Kirim Kode Reset"}
                </Button>
                <FieldDescription className="text-center">
                  Ingat password Anda? <Link href="/login">Masuk</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
