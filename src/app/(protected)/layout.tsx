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
      <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <AppSideBar />
        <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 gap-6">
          {/* Top Bar */}
          <div className="flex justify-end items-center bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
            <UserButton />
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl p-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SideBarLayout;