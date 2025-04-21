import { GoogleGenerativeAI } from '@google/generative-ai';
import { Document } from '@langchain/core/documents';
const gemini = new GoogleGenerativeAI("AIzaSyCqGgouPD9VT13bD95V9HYkeTzBv-JG8kE");

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const model = gemini.getGenerativeModel({
    model: 'gemini-1.5-flash'
});

export const aiSummariseCommit = async (diff: string) => {
  try {
    const prompt = `
You are an expert software engineer with extensive experience in analyzing Git diffs. Your task is to review the given Git diff and generate a clear, professional, and well-structured summary.

---

### 🔍 Input Format
- The Git diff may span multiple files and show lines added (+), removed (-), or unchanged (context).
- Metadata like \`diff --git a/file.js b/file.js\` indicates file-level changes.

---

### ✨ Your Output Requirements
- **Write the summary as bullet points**, starting each point with \`*\`.
- Separate each bullet point with a **newline (\\n)**.
- Focus on **clarity, purpose, and impact** of the changes.
- **DO NOT** include the raw diff content or filenames unless they provide useful context.
- Write in **past tense**.

---

### ✅ Good Summary Examples:
* Fixed a login validation bug by adding input sanitization [\`auth/login.ts\`]
* Added retry mechanism for failed API requests [\`utils/network.ts\`]
* Refactored caching logic to improve memory usage
* Removed deprecated helper function used across multiple modules

---

### ❌ Avoid:
- Vague phrases like “updated code”, “made changes”, “did cleanup”
- Redundant or verbose explanations

---

### 🧠 Instructions
1. **Understand the purpose**: Identify if the commit is a bug fix, feature, refactor, or optimization.
2. **Summarize impactfully**: What changed? Why? What’s the result?
3. **Be concise and professional**

---

Now analyze the following Git diff and summarize the key changes as bullet points:

\`\`\`diff
${diff}
\`\`\`
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

  const codeSnippet = doc.pageContent.slice(0, 10000); // ✅ Limit code snippet size

  const prompt = `
You are an experienced software engineer tasked with explaining source code functionality in a concise, professional manner. The goal is to help a developer or stakeholder understand what a particular file does in the context of a GitHub repository.

---

### 📄 File:
${doc.metadata.source}

### 📦 Code Snippet:
-------------------
${codeSnippet}
-------------------

### 📘 Guidelines:
- Explain the **purpose**, **logic**, and **implementation** of this code.
- Be clear and precise. Avoid unnecessary technical jargon.
- Keep the response **brief and well-structured** (max 100 words).
- Do not include greetings or narrative intros.
- Focus on **what this code does** and **why it matters**.

---

### ✅ Example Output:
This file implements a REST API handler for user authentication, including login, signup, and token verification. It validates input, checks credentials against the database, and responds with access tokens. Error handling ensures invalid requests are gracefully rejected.

---

Generate a similar summary for the provided code:
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
