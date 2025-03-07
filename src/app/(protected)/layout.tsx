import { SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';
import { UserButton } from '@clerk/nextjs';
import { AppSideBar } from './dashboard/app-sidebar';

type Props = {
  children: React.ReactNode;
};

const SideBarLayout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      {/* Main Layout */}
      <AppSideBar/>
      <main className="w-full m-2">
        
        <div className="flex items-center gap-2 border-sidebar-border bg-sidebar border p-3 shadow-md rounded-md">
          {/* Search Bar or Other Elements */}
          <div className="ml-auto">
            <UserButton />
          </div>
        </div>

        {/* Spacing */}
        <div className="h-4"></div>

        {/* Main Content */}
        <div className="border-sidebar-border bg-sidebar border p-4 rounded-md shadow">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default SideBarLayout;