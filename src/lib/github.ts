import { Octokit } from 'octokit';
import { db } from '@/server/db';
import axios from 'axios';
import { aiSummariseCommit } from './gemini';

export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

const GITHUB_URL = 'https://github.com/';

type Response = {
    commitHash: string;
    commitMessage: string;
    commitAuthor: string;
    commitDate: string;
    commitAuthorAvatar: string;
};

export const getCommitHashes = async (githubUrl: string): Promise<Response[]> => {
    const [owner, repo] = githubUrl.split('/').slice(-2);

    if (!owner || !repo) {
        throw new Error("Invalid GitHub URL");
    }

    const { data } = await octokit.rest.repos.listCommits({ owner, repo });

    return data.map((commit: any) => ({
        commitHash: commit.sha,
        commitMessage: commit.commit.message ?? "",
        commitAuthor: commit.commit.author.name ?? "",
        commitDate: commit.commit.author.date ?? "",
        commitAuthorAvatar: commit.author?.avatar_url ?? ""
    }));
};

export const pollCommits = async (projectId: string) => {
    const { project, githubUrl } = await getProjectDetails(projectId);
    const commits = await getCommitHashes(githubUrl);
    const unprocessedCommits = await filterUnprocessedCommits(projectId, commits);

    const summaryResponses = await Promise.allSettled(
        unprocessedCommits.map(commit => summariseCommit(githubUrl, commit.commitHash))
    );

    const summaries = summaryResponses.map(response =>
        response.status === 'fulfilled' ? response.value : ""
    );

    const commit = await db.commit.createMany({
        data: unprocessedCommits.map((commit, index) => ({
            projectId,
            commitHash: commit.commitHash,
            commitMessage: commit.commitMessage,
            commitAuthor: commit.commitAuthor,
            commitDate: commit.commitDate,
            commitAuthorAvatarUrl: commit.commitAuthorAvatar,
            summary: summaries[index] ?? ""
        }))
    });

    return commit;
};

const summariseCommit = async (githubUrl: string, commitHash: string) => {
    const [owner, repo] = githubUrl.split('/').slice(-2);

    const { data } = await axios.get(
        `https://github.com/${owner}/${repo}/commit/${commitHash}.diff`,
        { headers: { accept: 'application/vnd.github.v3.diff' } }
    );

    return await aiSummariseCommit(data) || "";
};

const getProjectDetails = async (projectId: string) => {
    const project = await db.project.findFirst({
        where: { id: projectId },
        select: { githubUrl: true }
    });

    if (!project?.githubUrl) {
        throw new Error('Project not found');
    }

    return { project, githubUrl: project.githubUrl };
};

const filterUnprocessedCommits = async (projectId: string, commitHashes: Response[]): Promise<Response[]> => {
    const processedCommits = await db.commit.findMany({
        where: { projectId }
    });

    return commitHashes.filter(commit =>
        !processedCommits.some(processedCommit => processedCommit.commitHash === commit.commitHash)
    );
};