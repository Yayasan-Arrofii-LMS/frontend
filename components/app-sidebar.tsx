"use client";

import * as React from "react";
import {
  IconCalendarEvent,
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconHelp,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { ProfileData } from "@/lib/api/profile";

const data = {
  navMain: [
    {
      title: "Dasbor",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Guru",
      url: "/teacher",
      icon: IconListDetails,
    },
    {
      title: "Kelas",
      url: "/course",
      icon: IconChartBar,
    },
    {
      title: "Workshop",
      url: "/workshop",
      icon: IconCalendarEvent,
    },
  ],
  navClouds: [
    {
      title: "Tangkapan",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Proposal Aktif",
          url: "#",
        },
        {
          title: "Arsip",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Proposal Aktif",
          url: "#",
        },
        {
          title: "Arsip",
          url: "#",
        },
      ],
    },
    {
      title: "Prompt",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Proposal Aktif",
          url: "#",
        },
        {
          title: "Arsip",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Pengaturan",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Bantuan",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Cari",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Perpustakaan Data",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Laporan",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Asisten Kata",
      url: "#",
      icon: IconFileWord,
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: ProfileData | null;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const userData = user
    ? {
        name: user.name,
        email: user.email,
        avatar: user.profileImage,
      }
    : {
        name: "User",
        email: "user@example.com",
        avatar: "/avatars/default.jpg",
      };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/home">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="text-base font-semibold">Sekolah Alam</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
