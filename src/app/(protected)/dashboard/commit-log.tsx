import React from "react";
import useProjects from "@/hooks/use-projects";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { MessageSquare, Clock } from "lucide-react";

const CommitLog = () => {
  const { projectId } = useProjects();
  const { data: commits, isLoading, error } = api.project.getCommits.useQuery({
    projectId,
  });

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading commits...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-sm text-destructive">Error: {error.message}</p>
      </div>
    );
  }

  if (!commits?.length) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-sm text-muted-foreground">No commits found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-card p-4 shadow-sm md:p-6">
      <h3 className="mb-4 text-lg font-medium">Commit History</h3>
      <div className="space-y-4">
        {commits.map((commit) => (
          <CommitCard key={commit.id} commit={commit} />
        ))}
      </div>
    </div>
  );
};

const CommitCard = ({ commit }) => {
  const [expanded, setExpanded] = React.useState(false);
  const hasSummary = commit.summary && commit.summary.trim() !== "";
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="overflow-hidden rounded-md border border-border bg-background transition-all hover:bg-muted/30">
      <div className="flex flex-col md:flex-row md:items-start">
        <div className="flex items-center p-3 md:w-16 md:justify-center">
          <div className="h-8 w-8 overflow-hidden rounded-full border border-border">
            <img
              src={commit.commitAuthorAvatarUrl || "/api/placeholder/32/32"}
              alt={`${commit.commitAuthor}'s avatar`}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        
        <div className="flex-1 p-3 pt-0 md:pt-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <p className="font-medium text-foreground">{commit.commitAuthor}</p>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock size={12} className="mr-1" />
              {formatDate(commit.commitDate)}
            </div>
          </div>
          
          <p className="mt-1 text-sm text-foreground">{commit.commitMessage}</p>
          
          {hasSummary && (
            <div className="mt-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center text-xs font-medium text-muted-foreground hover:text-primary"
              >
                <MessageSquare size={12} className="mr-1" />
                {expanded ? "Hide details" : "Show details"}
              </button>
              
              {expanded && (
                <ul className="mt-2 space-y-1 rounded-md bg-muted/50 p-3 text-sm">
                  {commit.summary
                    .split("\n")
                    .filter((line) => line.trim() !== "")
                    .map((line, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground md:text-sm">
                        <span className="mr-2 text-primary">•</span>
                        {line}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommitLog;