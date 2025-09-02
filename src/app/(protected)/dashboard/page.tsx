"use client";

import React, { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import useProjects from "@/hooks/use-projects";
import { Github, ExternalLink } from "lucide-react";
import Link from "next/link";
import CommitLog from "./commit-log";
import AskQuestion from "./ask-question";
import MeetingCard from "./meeting-card";
import { Button } from "@/components/ui/button";
import ArchiveButton from "./archive-button";
import TeamMembers from "./team-members";
import Invite from "./invite";
import { useRouter } from "next/navigation";

const DashboradPage = () => {
  const { project } = useProjects();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!project) {
      router.push("/create");
    }
  }, [project, router]);

  return (
    <div className="min-h-screen bg-background">
      {/* Main content */}
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        {/* Project GitHub Link */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-primary text-primary-foreground p-3 sm:p-4 rounded-md w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <Github className="size-4 sm:size-5" />
              <span className="text-sm sm:text-base">This project is linked to</span>
            </div>
            <Link 
              href={project?.githubUrl || "/"} 
              className="underline text-sm sm:text-base break-all sm:break-normal"
            >
              {project?.githubUrl}
            </Link>
            <ExternalLink className="size-3 sm:size-4 flex-shrink-0" />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full lg:w-auto">
            <Invite />
            <TeamMembers />
            <ArchiveButton />
          </div>
        </div>

        {/* AskQuestion & MeetingCard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-lg shadow-md bg-card text-card-foreground p-4 sm:p-6 border border-border">
            <AskQuestion />
          </div>
          <div className="rounded-lg shadow-md bg-card text-card-foreground p-4 sm:p-6 border border-border">
            <MeetingCard />
          </div>
        </div>

        {/* Commit Log */}
        <div className="rounded-lg shadow-md bg-card text-card-foreground p-4 sm:p-6 border border-border">
          <CommitLog />
        </div>
      </div>
    </div>
  );
};

export default DashboradPage;