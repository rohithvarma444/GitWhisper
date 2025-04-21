import { Octokit } from 'octokit';
import { db } from '@/server/db';
import axios from 'axios';
import { aiSummariseCommit } from './gemini';
import { log } from '@/lib/logger'; 

// Initialize Octokit
export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

// Type Definitions
type CommitInfo = {
    commitHash: string;
    commitMessage: string;
    commitAuthor: string;
    commitDate: string;
    commitAuthorAvatar: string;
};

// Utility: Extract owner and repo from GitHub URL
const parseGithubUrl = (url: string): [string, string] => {
    const [owner, repo] = url.split('/').slice(-2);
    if (!owner || !repo) throw new Error("Invalid GitHub URL");
    return [owner, repo];
};

// GitHub: Fetch all commit details
export const getCommitHashes = async (githubUrl: string): Promise<CommitInfo[]> => {
    const [owner, repo] = parseGithubUrl(githubUrl);

    const { data } = await octokit.rest.repos.listCommits({ owner, repo });


    // Debug logs removed for cleaner output

    return data.map(commit => ({
        commitHash: commit.sha,
        commitMessage: commit.commit.message ?? "",
        commitAuthor: commit.commit.author.name ?? "",
        commitDate: commit.commit.author.date ?? "",
        commitAuthorAvatar: commit.author?.avatar_url ?? "",
    }));
};


// Core: Poll new commits and store summaries
export const pollCommits = async (projectId: string) => {
    try {
        const { project, githubUrl } = await getProjectDetails(projectId);
        const commits = await getCommitHashes(githubUrl);

        
        const newCommits = await filterUnprocessedCommits(projectId, commits);

        const summaries = await Promise.allSettled(
            newCommits.map(commit => summariseCommit(githubUrl, commit.commitHash))
        );


        const processed = summaries.map(res =>
            res.status === 'fulfilled' ? res.value : ""
        );


        const inserted = await db.commit.createMany({
            data: newCommits.map((commit, index) => ({
                projectId,
                commitHash: commit.commitHash,
                commitMessage: commit.commitMessage,
                commitAuthor: commit.commitAuthor,
                commitDate: commit.commitDate,
                commitAuthorAvatarUrl: commit.commitAuthorAvatar,
                summary: processed[index],
            })),
        });


    } catch (err) {
    }
};



// AI: Summarise a single commit
const summariseCommit = async (githubUrl: string, commitHash: string) => {
    const [owner, repo] = parseGithubUrl(githubUrl);
    const diffUrl = `https://github.com/${owner}/${repo}/commit/${commitHash}.diff`;

    try {
        const { data } = await axios.get(diffUrl, {
            headers: { accept: 'application/vnd.github.v3.diff' },
        });

        const summary = await aiSummariseCommit(data);
        return summary || "";
    } catch (err) {
        return "";
    }
};

// DB: Get project details from database
const getProjectDetails = async (projectId: string) => {
    const project = await db.project.findFirst({
        where: { id: projectId },
        select: { githubUrl: true },
    });

    if (!project?.githubUrl) throw new Error('Project not found');
    return { project, githubUrl: project.githubUrl };
};

// DB: Filter out commits already in the database
const filterUnprocessedCommits = async (
    projectId: string,
    commitHashes: CommitInfo[]
): Promise<CommitInfo[]> => {
    const processedCommits = await db.commit.findMany({
        where: { projectId },
        select: { commitHash: true },
    });

    const processedSet = new Set(processedCommits.map(c => c.commitHash));
    return commitHashes.filter(c => !processedSet.has(c.commitHash));
};
