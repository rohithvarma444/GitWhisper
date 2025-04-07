"use client";

import React from 'react';
import { useUser } from '@clerk/nextjs';
import useProjects from '@/hooks/use-projects';
import { Github, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import CommitLog from './commit-log';
import AskQuestion from './ask-question';
import MeetingCard from './meeting-card';

const DashboradPage = () => {
    const { project } = useProjects();
    const { user } = useUser();

    return (
        <div className="flex min-h-screen bg-gray-50">

            {/* Main content */}
            <div className="flex-1 px-4 py-6 space-y-6 max-w-7xl mx-auto">
                {/* Project GitHub Link */}
                <div className="flex items-center bg-primary text-white p-4 rounded-lg shadow">
                    <Github className="size-5" />
                    <div className="flex ml-2 items-center gap-1 flex-wrap">
                        <span>This project is linked to</span>
                        <Link href={project?.githubUrl || "/"} className="underline">{project?.githubUrl}</Link>
                        <ExternalLink className="size-4" />
                    </div>
                </div>

                {/* AskQuestion & MeetingCard */}
                <div className="flex flex-col sm:flex-row gap-6 w-full">
                    <div className="w-full sm:w-1/2 rounded-lg shadow-md bg-white p-4">
                        <AskQuestion />
                    </div>
                    <div className="w-full sm:w-1/2 rounded-lg shadow-md bg-white p-4">
                        <MeetingCard />
                    </div>
                </div>

                {/* Commit Log */}
                <div className="rounded-lg shadow-md bg-white p-4">
                    <CommitLog />
                </div>
            </div>
        </div>
    );
};

export default DashboradPage;