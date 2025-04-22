"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Bot, CreditCard, Home, Presentation, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import git from "../../../../public/gitbg.png";
import { Button } from "@/components/ui/button";
import useProjects from "@/hooks/use-projects";
import useRefetch from "@/hooks/use-refetch";

const items = [
  { title: "Dashboard", icon: Home, href: "/dashboard" },
  { title: "Q&A", icon: Bot, href: "/qa" },
  { title: "Meetings", icon: Presentation, href: "/meetings" },
  { title: "Billing", icon: CreditCard, href: "/billing" },
];

export function AppSideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const refetch = useRefetch();
  const { projects, projectId, setProjectId } = useProjects();

  // Auto-collapse on screen resize
  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth <= 768);
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={cn(
        "h-screen bg-white shadow-md transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Sidebar Header */}
      <SidebarHeader className="flex flex-row items-center gap-2 p-3">
        <Image src={git} alt="GitWhisper Logo" width={40} height={40} />
        {!collapsed && <span className="text-2xl font-bold">GitWhisper</span>}
      </SidebarHeader>

      {/* Applications */}
      <SidebarGroup>
        {!collapsed && <SidebarGroupLabel>Applications</SidebarGroupLabel>}
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuButton asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-md transition",
                      pathname === item.href ? "bg-primary text-white" : "hover:bg-gray-200"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Projects Section */}
      <SidebarGroup>
        {!collapsed && <SidebarGroupLabel>Your Projects</SidebarGroupLabel>}
        <SidebarGroupContent>
          <SidebarMenu>
            {projects?.map((project) => {
              const isActive = project.id === projectId;
              return (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton asChild>
                    <Link
                      href="/dashboard"
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-md transition",
                        isActive ? "bg-primary text-white" : "hover:bg-gray-200"
                      )}
                      onClick={() => setProjectId(project.id)} // ✅ Properly updates the selected project
                    >
                      <div className="w-7 h-7 flex items-center justify-center text-sm rounded-md bg-black text-white">
                        {project.name.charAt(0)}
                      </div>
                      {!collapsed && <span>{project.name}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}

            {!collapsed && (
              <SidebarMenu className="mt-2">
                <Link href="/create">
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <Plus />
                    Create Project
                  </Button>
                </Link>
              </SidebarMenu>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  );
}