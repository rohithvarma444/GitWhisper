import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import "dotenv/config";
import { Document } from "@langchain/core/documents";
import { db } from "@/server/db";
import { summariseCode, generateEmbedding } from "./gemini";

export const loadGithubRepo = async (repoUrl: string, githubToken?: string) => {
  try {
    const loader = new GithubRepoLoader(repoUrl, {
      accessToken: githubToken,
      branch: "main",
      ignoreFiles: ["node_modules", "dist", "build", "coverage", "test", "tests"],
      recursive: true,
      unknown: 'warn',
      maxConcurrency: 5,
    });

    return await loader.load();
  } catch (error) {
    console.error("Error loading GitHub repository:", error);
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

        await db.sourceCodeEmbedding.create({
          data: {
            projectId,
            fileName: embedding.fileName,
            sourceCode: embedding.sourceCode,
            summary: embedding.summary,
            summaryEmbedding: embedding.embedding,
          },
        });
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