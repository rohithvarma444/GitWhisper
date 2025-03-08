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
import { Bot, CreditCard, Home, Presentation, Plus, Divide } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import git from "../../../../public/gitbg.png";
import { Button } from "@/components/ui/button";

const items = [
  { title: "Dashboard", icon: Home, href: "/dashboard" },
  { title: "Q&A", icon: Bot, href: "/qa" },
  { title: "Meetings", icon: Presentation, href: "/meetings" },
  { title: "Billing", icon: CreditCard, href: "/billing" },
];

const projects = [
  { title: "Project 1", href: "/project/1" },
  { title: "Project 2", href: "/project/2" },
];

export function AppSideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Auto-collapse on screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
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
      <SidebarHeader className="flex flex-row">
        <Image src={git} alt="GitRAG Logo" width={40} height={40} />
        {!collapsed && <span className="mt-1 text-2xl font-bold">GitRAG</span>}
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
            {projects.map((project, index) => {
              const isActive = pathname === project.href;
              return (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={project.href}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-md transition",
                        isActive ? "bg-primary text-white" : "hover:bg-gray-200"
                      )}
                    >
                      <div className="w-7 h-7 flex items-center justify-center text-sm rounded-md bg-black text-white">
                        {project.title.charAt(0)}
                      </div>
                      {!collapsed && <span>{project.title}</span>}
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