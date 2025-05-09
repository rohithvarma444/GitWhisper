import { Octokit } from 'octokit';
import { db } from '@/server/db';
import axios from 'axios';
import { aiSummariseCommit } from './gemini';

// Add the missing type definition
type CommitInfo = {
    commitHash: string;
    commitMessage: string;
    commitAuthor: string;
    commitDate: string;
    commitAuthorAvatar: string;
};

// Add the missing parseGithubUrl function
const parseGithubUrl = (url: string): [string, string] => {
    const [owner, repo] = url.split('/').slice(-2);
    if (!owner || !repo) throw new Error("Invalid GitHub URL");
    return [owner, repo];
};

// Update the octokit initialization to use the token more reliably
export const createOctokit = (token?: string) => {
  return new Octokit({
    auth: token || process.env.GITHUB_TOKEN,
  });
};

// Replace the existing octokit constant with a function
export const getOctokit = (token?: string) => {
  return createOctokit(token);
};

export const getCommitHashes = async (githubUrl: string, token?: string): Promise<CommitInfo[]> => {
    const [owner, repo] = parseGithubUrl(githubUrl);
    const octokit = getOctokit(token);

    const { data } = await octokit.rest.repos.listCommits({ 
        owner, 
        repo,
        per_page: 10 // Limit to top 10 commits
    });

    return data.map(commit => ({
        commitHash: commit.sha,
        commitMessage: commit.commit.message ?? "",
        commitAuthor: commit.commit?.author?.name ?? "",
        commitDate: commit.commit?.author?.date ?? "",
        commitAuthorAvatar: commit.author?.avatar_url ?? "",
    }));
};


export const pollCommits = async (projectId: string, token?: string) => {
    try {
        const { project, githubUrl } = await getProjectDetails(projectId);
        const commits = await getCommitHashes(githubUrl, token);
        
        const newCommits = await filterUnprocessedCommits(projectId, commits);

        if (newCommits.length === 0) {
            return { added: 0 };
        }

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

        return { added: inserted.count };
    } catch (err) {
        console.error("Error polling commits:", err);
        return { added: 0, error: err };
    }
};



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

const getProjectDetails = async (projectId: string) => {
    const project = await db.project.findFirst({
        where: { id: projectId },
        select: { githubUrl: true },
    });

    if (!project?.githubUrl) throw new Error('Project not found');
    return { project, githubUrl: project.githubUrl };
};

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
