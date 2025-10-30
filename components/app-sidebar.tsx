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
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
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
    {
      title: "Tim",
      url: "#",
      icon: IconUsers,
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
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Sekolah Alam</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
