import { SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';
import { UserButton } from '@clerk/nextjs';
import { AppSideBar } from './dashboard/app-sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';

type Props = {
  children: React.ReactNode;
};

const SideBarLayout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground transition-colors duration-300">
        <AppSideBar />
        <main className="flex-1 flex flex-col p-2 sm:p-4 md:p-6 lg:p-8 gap-4 sm:gap-6">
          {/* Top Bar */}
          <div className="flex justify-between items-center bg-card text-card-foreground shadow-md border border-border rounded-lg px-3 sm:px-4 py-2 sm:py-3">
            <ThemeToggle />
            <UserButton />
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-card text-card-foreground shadow-lg border border-border rounded-xl p-3 sm:p-4 md:p-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SideBarLayout;