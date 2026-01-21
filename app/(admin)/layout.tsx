import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { verifyAdminRole } from "@/lib/server/auth";
import { getProfile } from "@/lib/api/profile";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import React from "react";

// Force dynamic rendering for admin routes (requires authentication)
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side role verification
  const userRole = await verifyAdminRole();

  // If user is not an admin, return 404
  if (!userRole) {
    notFound();
  }

  // Get auth token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  // Fetch user profile
  let userProfile = null;
  if (token) {
    try {
      userProfile = await getProfile(token);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={userProfile} />
      <SidebarInset>
        <SiteHeader user={userProfile} hideUserProfile={true} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
