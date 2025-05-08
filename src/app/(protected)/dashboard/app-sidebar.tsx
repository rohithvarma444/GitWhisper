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
import { 
  Bot, 
  CreditCard, 
  Home, 
  Presentation, 
  Plus, 
  ChevronDown, 
  ChevronRight,
  ChevronLeft,
  Github,
  Code,
  Folder
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import git from "../../../../public/gitbg.png";
import { Button } from "@/components/ui/button";
import useProjects from "@/hooks/use-projects";
import useRefetch from "@/hooks/use-refetch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const pathname = usePathname();
  const refetch = useRefetch();
  const { projects, projectId, setProjectId } = useProjects();

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth <= 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width', 
      collapsed ? '4.5rem' : '18rem'
    );
    
    document.body.classList.add('has-sidebar');
    document.body.style.paddingLeft = 'var(--sidebar-width)';
    
    return () => {
      document.body.classList.remove('has-sidebar');
      document.body.style.paddingLeft = '0';
    };
  }, [collapsed]);

  const toggleProjects = () => {
    if (!collapsed) {
      setProjectsExpanded(!projectsExpanded);
    }
  };

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-sidebar shadow-md transition-all duration-300 ease-in-out z-30 text-sidebar-foreground border-r border-border",
          collapsed ? "w-[4.5rem]" : "w-72"
        )}
      >
        {/* Sidebar Header */}
        <SidebarHeader className="flex flex-row items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={cn("relative", collapsed && "mx-auto")}>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-full blur-sm opacity-70"></div>
              <div className="relative">
                <Image 
                  src={git} 
                  alt="GitWhisper Logo" 
                  width={36} 
                  height={36} 
                  className="rounded-full border-2 border-background"
                />
              </div>
            </div>
            {!collapsed && <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">GitWhisper</span>}
          </div>
          {!collapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-muted"
              onClick={() => setCollapsed(true)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {collapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-muted absolute right-2 top-4"
              onClick={() => setCollapsed(false)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </SidebarHeader>

        {/* Scrollable Sidebar Content */}
        <ScrollArea className="h-[calc(100vh-64px)]">
          <div className={cn("p-3", collapsed && "px-2")}>
            {/* Applications */}
            <SidebarGroup>
              {!collapsed && <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Navigation</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item, index) => (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-md transition-all duration-200",
                            collapsed && "justify-center p-3",
                            pathname === item.href 
                              ? "bg-primary/10 text-primary" + (!collapsed ? " border-l-2 border-primary pl-[calc(0.5rem-2px)]" : "") 
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <item.icon className={cn(
                            "h-5 w-5",
                            pathname === item.href ? "text-primary" : "text-muted-foreground"
                          )} />
                          {!collapsed && <span>{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Projects Section */}
            <div className="mt-6">
              {!collapsed ? (
                <div 
                  className="flex items-center justify-between mb-2 cursor-pointer group"
                  onClick={toggleProjects}
                >
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Projects</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full hover:bg-muted">
                    {projectsExpanded ? (
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center mb-3 mt-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-sidebar-accent/30">
                    <Folder className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              )}

              {(projectsExpanded || collapsed) && (
                <div className={cn(
                  "space-y-2 transition-all duration-200",
                  collapsed ? "px-0" : ""
                )}>
                  {projects?.map((project) => {
                    const isActive = project.id === projectId;
                    return (
                      <div 
                        key={project.id}
                        className={cn(
                          "relative group transition-all duration-200",
                          isActive && !collapsed ? "bg-primary/5 rounded-md" : "",
                          collapsed && "flex justify-center"
                        )}
                      >
                        {isActive && !collapsed && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full" />
                        )}
                        <Link
                          href="/dashboard"
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-md transition-all",
                            collapsed && "p-1 w-full justify-center",
                            isActive 
                              ? "text-primary" 
                              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                          )}
                          onClick={() => setProjectId(project.id)}
                        >
                          {collapsed ? (
                            <div className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-md text-sm",
                              isActive 
                                ? "bg-primary text-primary-foreground ring-2 ring-primary/20" 
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}>
                              {project.name.charAt(0)}
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-3 flex-1">
                                <div className={cn(
                                  "flex h-8 w-8 items-center justify-center rounded-md text-sm",
                                  isActive 
                                    ? "bg-primary text-primary-foreground" 
                                    : "bg-muted text-muted-foreground"
                                )}>
                                  {project.name.charAt(0)}
                                </div>
                                <div className="flex-1 truncate">
                                  <p className="text-sm font-medium truncate">{project.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {project.githubUrl?.replace('https://github.com/', '') || 'GitHub Project'}
                                  </p>
                                </div>
                              </div>
                              {isActive && (
                                <div className="h-2 w-2 rounded-full bg-primary mr-1"></div>
                              )}
                            </>
                          )}
                        </Link>
                      </div>
                    );
                  })}

                  {!collapsed && (
                    <Link 
                      href="/create"
                      className="flex items-center gap-2 p-2 rounded-md border border-dashed border-border hover:bg-sidebar-accent/50 transition-colors group"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted group-hover:bg-primary/10">
                        <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground group-hover:text-foreground">New Project</span>
                    </Link>
                  )}

                  {collapsed && (
                    <Link 
                      href="/create"
                      className="flex justify-center p-1 rounded-md hover:bg-sidebar-accent/50 transition-colors"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted hover:bg-primary/10">
                        <Plus className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </div>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </aside>
      
      <style jsx global>{`
        :root {
          --sidebar-width: ${collapsed ? '4.5rem' : '18rem'};
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