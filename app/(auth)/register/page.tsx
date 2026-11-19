import { Suspense } from "react";
import { SignupForm } from "@/components/auth/signup-form";
import { AuthLayout } from "../_components";

export default function RegisterPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Memuat formulir pendaftaran...</div>}>
        <SignupForm />
      </Suspense>
    </AuthLayout>
  );
}
