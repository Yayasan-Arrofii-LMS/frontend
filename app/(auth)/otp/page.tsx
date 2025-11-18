import { OTPForm } from "@/components/otp-form";
import { AuthLayout } from "../_components";

export default function OTPPage() {
  return (
    <AuthLayout maxWidth="xs">
      <OTPForm />
    </AuthLayout>
  );
}
