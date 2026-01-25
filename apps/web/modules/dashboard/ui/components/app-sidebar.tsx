"use client";

import Link from "next/link";
import Image from "next/image";
import { NavUser } from "@/modules/dashboard/ui/components/nav-user";
import { NavMain } from "@/modules/dashboard/ui/components/nav-main";
import { NavSecondary } from "@/modules/dashboard/ui/components/nav-secondary";
import { LayoutDashboard, Search, Settings, Wrench, Tag, FileText, Code } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Tools",
      url: "/dashboard/tools",
      icon: Wrench,
    },
    {
      title: "Categories",
      url: "/dashboard/categories",
      icon: Tag,
    },
    {
      title: "Pages",
      url: "/dashboard/pages",
      icon: FileText,
    },
    {
      title: "Scripts",
      url: "/dashboard/scripts",
      icon: Code,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <Link href="/dashboard" className="flex items-center gap-0.5 cursor-pointer">
                {/* Placeholder Logo Icon */}
                <div className="rounded-lg flex items-center justify-center relative w-12 h-12">
                  <Image src="/logo.svg" alt="Monkey Logo" fill sizes="35px" className="object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold leading-none tracking-tight">Monkey</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
