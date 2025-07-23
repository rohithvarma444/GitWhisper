import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Document } from '@langchain/core/documents';
import * as dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });


const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const model = gemini.getGenerativeModel({
    model: 'gemini-2.5-flash'
});

export const aiSummariseCommit = async (diff: string) => {
  try {
    const prompt = `
You are a seasoned software engineer specializing in Git diff analysis. Your mission is to dissect the provided Git diff and produce a concise, professional summary highlighting the key changes. Present your summary as bullet points, with each point separated by a newline character (\`\\n\`). Focus on the purpose, impact, and clarity of the changes.

Avoid including raw diff content or filenames unless they are crucial for context. Steer clear of vague phrases like "updated code" or "made changes." Instead, concentrate on providing insightful descriptions of what changed, why it changed, and the resulting effect.

Here's the Git diff for your analysis:

\`\`\`diff
${diff}
\`\`\`

Your summary should adhere to the following guidelines:

*   Each bullet point should start with an asterisk (\`*\`).
*   Each bullet point should be separated by a newline character (\`\\n\`).
*   Use past tense to describe the changes.
*   Focus on the "what, why, and impact" of each change.
*   Be concise and professional in your language.

For example:

* Fixed a critical security vulnerability in the authentication module [\`auth.js\`]\n
* Implemented a new rate-limiting mechanism to prevent abuse\n
* Refactored the data processing pipeline to improve performance and scalability\n
* Enhanced error logging to facilitate debugging and troubleshooting

Now, please provide your well-structured and insightful summary of the provided Git diff. Consider this an exercise in demonstrating your expertise in understanding and communicating software changes effectively. I expect a clear, professional response suitable for technical stakeholders.
`;

    console.log("🧠 Generating commit summary...");

    const response = await model.generateContent([prompt]);

    if (!response?.response?.text) {
      console.warn("⚠️ No response text returned from Gemini");
      return "";
    }

    const result = await response.response.text();
    console.log("✅ Commit summary generated");
    return result;
  } catch (error) {
    console.error("❌ Error generating commit summary:", error);
    return "";
  }
};

export const summariseCode = async (doc: Document): Promise<string> => {
  console.log("🔹 Generating summarization for source code...");

  const codeSnippet = doc.pageContent.slice(0, 10000); 

  const prompt = `
You're an experienced software engineer, explaining code to a colleague. Your goal is to quickly and clearly explain the purpose of a specific file in a GitHub repository. Here's the file path and code snippet:

### 📄 File:
${doc.metadata.source}

### 📦 Code Snippet:
-------------------
${codeSnippet}
-------------------

Based on the code above, provide a concise explanation (under 100 words) of the file's function. Focus on these aspects:

*   **Purpose:** What problem does this code solve? What's its high-level goal?
*   **Logic:** How does the code achieve its purpose? Briefly describe the main steps or algorithms involved.
*   **Implementation:** What are the key components or techniques used (e.g., data structures, libraries, specific functions)?
*   **Importance:** Why is this file important to the overall project? What would break if it were removed or malfunctioning?

Avoid unnecessary technical jargon and write in a friendly, encouraging tone. Think of it as helping a teammate understand a critical piece of the system. Assume they have general programming knowledge but might be unfamiliar with this specific code. Let them know they are doing a great job by focusing and learning about new code.

Here's an example of the kind of response I'm looking for:

### ✅ Example Output:
This file implements a REST API handler for user authentication, including login, signup, and token verification. It validates input, checks credentials against the database, and responds with access tokens. Error handling ensures invalid requests are gracefully rejected. This is crucial for securing the application and managing user access. Keep up the great work learning new things!
`;

  try {
    const embeddings = await model.generateContent([prompt]);
    return await embeddings.response.text();
  } catch (error) {
    console.error(`❌ Error generating summary for ${doc.metadata.source}:`, error);
    return "Error generating summary.";
  }
};

export const generateEmbedding = async (summary: string): Promise<number[]> => {
  try {
    const embeddingModel = gemini.getGenerativeModel({
      model: "embedding-001",
    });

    const result = await embeddingModel.embedContent(summary);

    return result.embedding.values;
  } catch (error) {
    console.error("❌ Error generating embedding:", error);
    return [];
  }
};
