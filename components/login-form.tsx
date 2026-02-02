"use client";

import { cn } from "@/lib/utils";
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
import { useRouter, useSearchParams } from "next/navigation";
import { login, setAuthToken } from "@/lib/api/auth";
import { toast } from "sonner";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    usernameoremail: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.usernameoremail.trim()) {
      newErrors.usernameoremail = "Email atau username wajib diisi";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password wajib diisi";
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
      const response = await login(formData);

      // Check if user needs to reset password
      if (response.success && response.data?.resetToken) {
        toast.info(response.message || "Silakan perbarui password Anda");
        
        // Store reset token in sessionStorage
        sessionStorage.setItem("reset_token", response.data.resetToken);
        
        // Redirect to reset password page
        router.push(`/reset-password?token=${response.data.resetToken}`);
        return;
      }

      if (response.success && response.data?.token) {
        toast.success(response.message || "Login berhasil!");
        
        // Store token and user info
        setAuthToken(response.data.token, {
          username: response.data.username,
          email: response.data.email,
          name: response.data.name,
          role: response.data.role,
        });

        // Get redirect URL from query params or default based on role
        const from = searchParams.get("from");
        const role = response.data.role?.toLowerCase();

        if (from && from !== "/login") {
          // Redirect to the page user was trying to access
          router.push(from);
        } else if (role === "admin") {
          router.push("/dashboard");
        } else if (role === "teacher") {
          router.push("/class");
        } else {
          router.push("/home");
        }
      } else {
        toast.error(response.message || "Login gagal");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login gagal";

      // Cek apakah akun belum diverifikasi
      if (
        message.includes("not verified") ||
        message.includes("Account not verified")
      ) {
        toast.error("Silakan verifikasi akun Anda terlebih dahulu");
        // Store email untuk verification jika ada di usernameoremail
        if (formData.usernameoremail.includes("@")) {
          sessionStorage.setItem(
            "verification_email",
            formData.usernameoremail
          );
          router.push("/otp");
        }
      } else {
        // Tampilkan pesan error apa adanya dari backend
        toast.error(message);
      }
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Masuk ke akun Anda</CardTitle>
          <CardDescription>
            Masukkan email atau username Anda untuk masuk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="usernameoremail">
                  Email atau Username
                </FieldLabel>
                <Input
                  id="usernameoremail"
                  type="text"
                  placeholder="sekolah@alam.com atau sekolahalam"
                  value={formData.usernameoremail}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
                {errors.usernameoremail && (
                  <FieldDescription className="text-red-500">
                    {errors.usernameoremail}
                  </FieldDescription>
                )}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Lupa password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
                {errors.password && (
                  <FieldDescription className="text-red-500">
                    {errors.password}
                  </FieldDescription>
                )}
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Masuk..." : "Masuk"}
                </Button>
                <Button 
                  variant="outline" 
                  type="button" 
                  disabled={true}
                  className="opacity-50 cursor-not-allowed"
                >
                  Masuk dengan Google
                </Button>
                <FieldDescription className="text-center">
                  Belum punya akun?{" "}
                  <Link href="/register">Daftar</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
