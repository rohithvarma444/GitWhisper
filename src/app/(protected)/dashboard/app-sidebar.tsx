"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Image from "next/image";

import logo from '../../../../public/logo.png';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bot, CreditCard, Home, Presentation, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Card } from "@/components/ui/card";

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
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="floating">
      {/* Sidebar Header */}
      <SidebarHeader className="text-2xl font-bold">
        <div className="flex">
            <h2 className="text-2xl">GitRAG</h2>
        </div>
      </SidebarHeader>

      {/* Applications */}
      <SidebarGroup>
        <SidebarGroupLabel>Applications</SidebarGroupLabel>
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
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Projects Section */}
      <SidebarGroup>
        <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
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
                      {/* First Letter Icon */}
                      <div
                        className={cn(
                          "w-7 h-7 flex items-center justify-center text-sm rounded-md",
                          true ? "bg-black text-white" : "bg-white text-black border border-gray-400"
                        )}
                      >
                        {project.title.charAt(0)}
                      </div>
                      <span>{project.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}


            <SidebarMenuItem>
                <Link href = '/create' >
                <Button variant={"outline"} className="w-fit mt-2">Create Project</Button>
                </Link>
        </SidebarMenuItem>
          </SidebarMenu>

       
        </SidebarGroupContent>
      </SidebarGroup>
    </Sidebar>
  );
}