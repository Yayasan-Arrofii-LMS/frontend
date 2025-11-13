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
import { useRouter } from "next/navigation";
import { login, setAuthToken } from "@/lib/api/auth";
import { toast } from "sonner";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    usernameoremail: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.usernameoremail.trim()) {
      newErrors.usernameoremail = "Email or username is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
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

      if (response.success && response.data?.token) {
        toast.success(response.message || "Login successful!");
        setAuthToken(response.data.token);
        
        // Redirect based on role
        const role = response.data.role?.toLowerCase();
        
        if (role === "admin") {
          router.push("/dashboard");
        } else if (role === "teacher") {
          router.push("/class");
        } else {
          router.push("/home");
        }
      } else {
        toast.error(response.message || "Login failed");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";

      // Cek apakah akun belum diverifikasi
      if (
        message.includes("not verified") ||
        message.includes("Account not verified")
      ) {
        toast.error("Please verify your account first");
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
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email or username below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="usernameoremail">
                  Email or Username
                </FieldLabel>
                <Input
                  id="usernameoremail"
                  type="text"
                  placeholder="sekolah@alam.com or sekolahalam"
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
                    Forgot your password?
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
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                <Button variant="outline" type="button" disabled={isLoading}>
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link href="/register">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
