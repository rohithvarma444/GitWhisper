import React from "react";
import useProjects from "@/hooks/use-projects";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";

const parseSummary = (summary: string) => {
  return summary
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line, idx) => (
      <li key={idx} className="text-sm text-muted-foreground">
        🔹 {line}
      </li>
    ));
};

const CommitLog = () => {
  const { projectId } = useProjects();
  const { data: commits, isLoading, error } = api.project.getCommits.useQuery({
    projectId,
  });

  if (isLoading)
    return <p className="text-muted-foreground text-center">Loading commits...</p>;
  if (error)
    return <p className="text-destructive text-center">Error: {error.message}</p>;

  return (
    <div className="p-6 bg-card shadow-md rounded-lg">
      <ul className="relative border-l-2 border-border pl-6 space-y-6">
        {commits?.map((commit, commitIdx) => (
          <li key={commit.id} className="relative flex items-start space-x-4">
            <div className="absolute -left-3 w-6 h-6 flex items-center justify-center bg-secondary rounded-full border border-border">
              <img
                src={commit.commitAuthorAvatarUrl}
                alt="Author Avatar"
                className="w-6 h-6 rounded-full border border-white"
              />
            </div>

            <div className="p-4 bg-muted rounded-lg shadow-sm w-full">
              <p className="text-sm font-semibold text-foreground">{commit.commitAuthor}</p>
              <p className="text-xs text-muted-foreground italic">{commit.commitMessage}</p>

              {commit.summary && (
                <ul className="mt-2 space-y-1">{parseSummary(commit.summary)}</ul>
              )}

              <p className="text-xs text-muted-foreground mt-2">
                {new Date(commit.commitDate).toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommitLog;