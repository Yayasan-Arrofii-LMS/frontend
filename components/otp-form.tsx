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
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOTP, resendOTP } from "@/lib/api/auth";
import { toast } from "sonner";

export function OTPForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const isForgotPasswordFlow = searchParams.get("flow") === "forgot-password";

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
        toast.info("If you don't receive OTP, click Resend button");
        sessionStorage.setItem("otp_sent", "true");
      }
    } else {
      toast.error("Email not found. Please register again.");
      router.push("/register");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    if (!email) {
      toast.error("Email not found");
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyOTP({ email, code: otp });

      if (response.success) {
        toast.success(response.message || "OTP verified successfully!");

        if (isForgotPasswordFlow && response.data?.token) {
          // For forgot password flow, store reset token and redirect to reset password
          sessionStorage.setItem("reset_token", response.data.token);
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
        toast.error(response.message || "Invalid or expired OTP");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to verify OTP"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Email not found");
      return;
    }

    setIsResending(true);

    try {
      const response = await resendOTP(email);

      if (response.success) {
        toast.success(response.message || "OTP resent successfully!");
        setOtp(""); // Clear OTP input
      } else {
        toast.error(response.message || "Failed to resend OTP");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to resend OTP"
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Enter verification code</CardTitle>
        <CardDescription>
          We sent a 6-digit code to {email ? email : "your email"}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="otp">Verification code</FieldLabel>
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
                Enter the 6-digit code sent to your email.
              </FieldDescription>
            </Field>
            <FieldGroup>
              <Button type="submit" disabled={isLoading || otp.length !== 6}>
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
              <FieldDescription className="text-center">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="underline hover:text-primary"
                >
                  {isResending ? "Sending..." : "Resend"}
                </button>
              </FieldDescription>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
