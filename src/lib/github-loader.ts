import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import "dotenv/config";
import { Document } from "@langchain/core/documents";
import { db } from "@/server/db";
import { summariseCode, generateEmbedding } from "./gemini";
import { sendIndexingCompletionEmail, IndexingCompletionEmailData } from "./email";

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

export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string, userEmail?: string, userName?: string) => {
  const startTime = Date.now();
  
  try {
    console.log("🚀 Starting repository indexing...");
    const docs = await loadGithubRepo(githubUrl, githubToken);
    console.log(`📁 Loaded ${docs.length} files from repository`);
    
    // Process files sequentially to respect rate limits
    const allEmbeddings = await getEmbeddingsSequential(docs);
    console.log(`🧠 Generated ${allEmbeddings.length} AI summaries`);

    // Store embeddings in database
    let successCount = 0;
    for (const embedding of allEmbeddings) {
      if (!embedding) continue;

      try {
        const sourceCodeEmbeddings = await db.sourceCodeEmbedding.create({
          data: {
            summary: embedding.summary,
            sourceCode: embedding.sourceCode,
            fileName: embedding.fileName,
            projectId,
          },
        });

        await db.$executeRaw`
          UPDATE "SourceCodeEmbedding"
          SET "summaryEmbedding" = ${embedding.embedding}
          WHERE id = ${sourceCodeEmbeddings.id}
        `;

        successCount++;
        console.log(`✅ Successfully indexed: ${embedding.fileName}`);
      } catch (error) {
        console.error(`❌ Failed to index ${embedding.fileName}:`, error);
      }
    }

    const processingTime = Math.round((Date.now() - startTime) / 1000);
    const processingTimeFormatted = processingTime < 60 
      ? `${processingTime} seconds` 
      : `${Math.round(processingTime / 60)} minutes`;

    console.log(`🎉 Successfully indexed repository: ${githubUrl} (${successCount}/${allEmbeddings.length} files)`);

    // Send completion email if user email is provided
    if (userEmail && userName) {
      try {
        const emailData: IndexingCompletionEmailData = {
          userName,
          projectName: githubUrl.split('/').pop() || 'Repository',
          githubUrl,
          totalFiles: successCount,
          totalCommits: 0, // Will be updated after commit processing
          processingTime: processingTimeFormatted,
          userEmail,
        };
        
        await sendIndexingCompletionEmail(emailData);
        console.log("📧 Completion email sent successfully");
      } catch (error) {
        console.error("❌ Failed to send completion email:", error);
        // Don't throw error for email failure
      }
    }

    return { success: true, filesIndexed: successCount, processingTime: processingTimeFormatted };
  } catch (error) {
    console.error("Error indexing GitHub repository:", error);
    throw new Error("Failed to index GitHub repository.");
  }
};

// Sequential processing to respect rate limits
const getEmbeddingsSequential = async (docs: Document[]) => {
  const results = [];
  
  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    console.log(`📝 Processing file ${i + 1}/${docs.length}: ${doc.metadata.source}`);
    
    try {
      const summary = await summariseCode(doc);
      const embedding = await generateEmbedding(summary);
      results.push({
        summary,
        embedding,
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
        fileName: doc.metadata.source,
      });
    } catch (error) {
      console.error(`❌ Failed to process ${doc.metadata.source}:`, error);
      // Continue with next file instead of failing completely
      results.push(null);
    }
  }
  
  return results;
};

// Keep the old function for backward compatibility (but it's not used anymore)
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