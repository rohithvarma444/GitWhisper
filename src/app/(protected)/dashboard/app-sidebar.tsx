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
import { useEffect, useState, createContext, useContext } from "react";
import { Bot, CreditCard, Home, Presentation, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import git from "../../../../public/gitbg.png";
import { Button } from "@/components/ui/button";
import useProjects from "@/hooks/use-projects";
import useRefetch from "@/hooks/use-refetch";

// Create a context to share the sidebar state
export const SidebarContext = createContext({ collapsed: false });

export function useSidebar() {
  return useContext(SidebarContext);
}

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

  // Apply sidebar width to document for the main content margin
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width', 
      collapsed ? '4rem' : '16rem'
    );
    
    // Add a class to the body to handle the layout
    document.body.classList.add('has-sidebar');
    document.body.style.paddingLeft = 'var(--sidebar-width)';
    
    return () => {
      document.body.classList.remove('has-sidebar');
      document.body.style.paddingLeft = '0';
    };
  }, [collapsed]);

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-white shadow-md transition-all duration-300 ease-in-out z-30",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Sidebar Header */}
        <SidebarHeader className="flex flex-row items-center gap-2 p-3">
          <Image src={git} alt="GitWhisper Logo" width={40} height={40} />
          {!collapsed && <span className="text-2xl font-bold">GitWhisper</span>}
        </SidebarHeader>

        {/* Scrollable Sidebar Content */}
        <div className="h-[calc(100vh-64px)] overflow-y-auto">
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
                        <item.icon className="h-5 w-5" />
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
                          onClick={() => setProjectId(project.id)}
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-black text-sm text-white">
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
                      <Button variant="outline" className="flex w-full items-center gap-2">
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
      </aside>
      
      {/* Add some global styles to your CSS or in a style tag in your layout */}
      <style jsx global>{`
        :root {
          --sidebar-width: ${collapsed ? '4rem' : '16rem'};
        }
        
        body.has-sidebar {
          padding-left: var(--sidebar-width);
          transition: padding-left 0.3s ease-in-out;
        }
      `}</style>
    </SidebarContext.Provider>
  );
}

export default AppSideBar;