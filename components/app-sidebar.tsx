"use client";

import * as React from "react";
import {
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

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
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
      url: "/class",
      icon: IconChartBar,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
