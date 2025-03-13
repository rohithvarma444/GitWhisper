import {Octokit} from 'octokit';
import { db } from '@/server/db';

export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
})

const url = 'https://github.com/'


type Response = {
    commitHash: string
    commitMessage: string
    commitAuthor: string
    commitDate: string
    commitAuthorAvatar: string
}
export const getCommitHashes = async (githubUrl: String): Promise<Response[]> => {

    const [owner,repo] = githubUrl.split('/').slice(-2)

    if(!owner || !url){
        throw new Error("Invalid Github Url")
    }
    const {data} = await octokit.rest.repos.listCommits({
        owner,
        repo
    })

    const sortedCommits = data.sort((a: any,b: any) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime())

    return sortedCommits.map((commit: any) => {
        return {
            commitHash: commit.sha as string,
            commitMessage: commit.commit.message ?? "",
            commitAuthor: commit.commit.author.name ?? "",
            commitDate: commit.commit.author.date ?? "",
            commitAuthorAvatar: commit.author.avatar_url ?? ""
        }
    }
    )
}

export const pollCommits = async (projectId: string) => {

    const {project, githubUrl} = await getProjectDetails(projectId);
    const commits = await getCommitHashes(githubUrl);
    const unprocessedCommits = await filterUnprocessedCommits(projectId, commits);

    return unprocessedCommits;
}

const summariseCommit = async() => {

}


const getProjectDetails = async (projectId: string) => {
    const project = await db.project.findFirst({
        where: {
            id: projectId
        },
        select: {
            githubUrl: true
        }
    })

    if(!project?.githubUrl){
        throw new Error('Project not found')
    }

    return {project, githubUrl: project?.githubUrl}
}


const filterUnprocessedCommits = async (projectId: string, commitHashes: Response[]) => {
    const processedCommits = await db.commit.findMany({
        where: {
            projectId: projectId
        }
    })

    const unprocessedCommits = commitHashes.filter((commit) => !processedCommits.some((processedCommit) => processedCommit.commitHash === commit.commitHash))
}