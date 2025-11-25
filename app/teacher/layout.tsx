import { PublicNavbar } from "@/components/public-navbar";
import { verifyUserRole } from "@/lib/server/auth";
import { notFound } from "next/navigation";
import React from "react";

// Force dynamic rendering for teacher routes (requires authentication)
export const dynamic = 'force-dynamic';

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side role verification - only allow teachers
  const userRole = await verifyUserRole(["Teacher"]);

  // If user is not a teacher, return 404
  if (!userRole) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
