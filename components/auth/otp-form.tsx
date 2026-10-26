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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { verifyOTP, resendOTP } from "@/lib/api/auth";
import { toast } from "sonner";

export function OTPForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Get email from session storage
    const storedEmail = sessionStorage.getItem("verification_email");
    if (storedEmail) {
      setEmail(storedEmail);

      // Check if OTP was already sent during registration
      const otpSent = sessionStorage.getItem("otp_sent");
      if (!otpSent) {
        // If OTP wasn't sent yet (shouldn't happen in normal flow, but just in case)
        // Backend should send OTP during registration, but we can resend as backup
        toast.info("Jika Anda tidak menerima OTP, klik tombol Kirim Ulang");
        sessionStorage.setItem("otp_sent", "true");
      }
    } else {
      toast.error("Email tidak ditemukan. Silakan daftar lagi.");
      router.push("/register");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Silakan masukkan kode 6 digit yang valid");
      return;
    }

    if (!email) {
      toast.error("Email tidak ditemukan");
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyOTP({ email, code: otp });

      if (response.success) {
        toast.success(response.message || "OTP berhasil diverifikasi!");

        if (response.data?.reset_token) {
          // For forgot password flow, store reset token and redirect to reset password
          sessionStorage.setItem("reset_token", response.data.reset_token);
          sessionStorage.removeItem("verification_email");
          sessionStorage.removeItem("otp_sent");
          router.push("/reset-password");
        } else {
          // For registration flow, redirect to login
          sessionStorage.removeItem("verification_email");
          sessionStorage.removeItem("otp_sent");
          router.push("/login");
        }
      } else {
        toast.error(response.message || "OTP tidak valid atau kedaluwarsa");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal memverifikasi OTP"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Email tidak ditemukan");
      return;
    }

    setIsResending(true);

    try {
      const response = await resendOTP(email);

      if (response.success) {
        toast.success(response.message || "OTP berhasil dikirim ulang!");
        setOtp(""); // Clear OTP input
      } else {
        toast.error(response.message || "Gagal mengirim ulang OTP");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mengirim ulang OTP"
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Masukkan kode verifikasi</CardTitle>
        <CardDescription>
          Kami mengirim kode 6 digit ke {email ? email : "email Anda"}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="otp">Kode verifikasi</FieldLabel>
              <InputOTP
                maxLength={6}
                id="otp"
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={isLoading}
                required
              >
                <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <FieldDescription>
                Masukkan kode 6 digit yang dikirim ke email Anda.
              </FieldDescription>
            </Field>
            <FieldGroup>
              <Button type="submit" disabled={isLoading || otp.length !== 6}>
                {isLoading ? "Memverifikasi..." : "Verifikasi"}
              </Button>
              <FieldDescription className="text-center">
                Tidak menerima kode?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="underline hover:text-primary"
                >
                  {isResending ? "Mengirim..." : "Kirim Ulang"}
                </button>
              </FieldDescription>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
