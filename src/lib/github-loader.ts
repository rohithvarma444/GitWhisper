import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import "dotenv/config";
import { Document } from "@langchain/core/documents";
import { db } from "@/server/db";
import { summariseCode, generateEmbedding } from "./gemini";

export const loadGithubRepo = async (repoUrl: string, githubToken?: string) => {
  try {
    const token = githubToken || process.env.GITHUB_TOKEN;
    
    if (!token) {
      throw new Error("GitHub token is required for API access");
    }
    
    const loader = new GithubRepoLoader(repoUrl, {
      accessToken: token,
      branch: "main",
      ignoreFiles: ["node_modules", "dist", "build", "coverage", "test", "tests","package-lock.json","package.json",".bundle",".gitignore",".env",".env.local",".env.development",".env.test",".env.production",".env.local",".env.development.local",".env.test.local",".env.production.local"],
      recursive: true,
      unknown: 'warn',
      maxConcurrency: 5,
    });

    return await loader.load();
  } catch (error: any) {
    console.error("Error loading GitHub repository:", error);
    
    if (error.toString().includes("rate limit")) {
      throw new Error("GitHub API rate limit exceeded. Please check your token or try again later.");
    }
    
    throw new Error("Failed to load GitHub repository.");
  }
};

export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string) => {
  try {
    const docs = await loadGithubRepo(githubUrl, githubToken);
    const allEmbeddings = await getEmbeddings(docs);

    await Promise.all(
      allEmbeddings.map(async (embedding) => {
        if (!embedding) return;

        const sourceCodeEmbeddings = await db.sourceCodeEmbedding.create({
          data: {
            summary: embedding.summary,
            sourceCode: embedding.sourceCode,
            fileName: embedding.fileName,
            projectId,
          },
        });

        const insertembeddings = await db.$executeRaw`
          UPDATE "SourceCodeEmbedding"
          SET "summaryEmbedding" = ${embedding.embedding}
          WHERE id = ${sourceCodeEmbeddings.id}
        `;

        console.log(insertembeddings ? `Successfully indexed source code: ${embedding.fileName}` : "Failed to index source code.");
      })
    );

    console.log(`Successfully indexed repository: ${githubUrl}`);
  } catch (error) {
    console.error("Error indexing GitHub repository:", error);
    throw new Error("Failed to index GitHub repository.");
  }
};

const getEmbeddings = async (docs: Document[]) => {
  try {
    return await Promise.all(
      docs.map(async (doc) => {
        const summary = await summariseCode(doc);
        const embedding = await generateEmbedding(summary);
        return {
          summary,
          embedding,
          sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
          fileName: doc.metadata.source,
        };
      })
    );
  } catch (error) {
    console.error("Error generating embeddings:", error);
    return [];
  }
};