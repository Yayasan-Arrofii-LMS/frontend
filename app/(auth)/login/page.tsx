import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { AuthLayout } from "../_components";

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Memuat formulir masuk...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
