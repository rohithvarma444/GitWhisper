import { GoogleGenerativeAI } from '@google/generative-ai';
import { Document } from '@langchain/core/documents';
const gemini = new GoogleGenerativeAI("AIzaSyAmKDxAeINhTQbR3lrrUnE5rh5NWVUswHQ");

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const model = gemini.getGenerativeModel({
    model: 'gemini-1.5-flash'
});

export const aiSummariseCommit = async (diff: string) => {
   await sleep(1000); 
   await sleep(1000); 
    try {
        
        const prompt = `
You are an **expert software engineer** skilled in analyzing Git diffs. Your task is to **analyze** the given Git diff and generate a **clear, concise, and structured summary** of the changes made in the commit.

### **📌 Git Diff Format Reminder:**
1. Each modified file starts with a metadata line:
   - Example: \`diff --git a/src/index.js b/src/index.js\`
2. File modification details are specified:
   - **Lines added** start with \`+\`
   - **Lines removed** start with \`-\`
   - **Other lines** provide context and are not part of the actual change.

---

### **🔹 Instructions for Generating the Summary:**
1. **Identify the purpose of the commit**  
   - What is the main goal of these changes? (Bug fix, feature addition, refactoring, optimization, etc.)

2. **Summarize changes in a structured, human-readable format**  
   - Provide a **short bullet-point summary** of the changes.
   - If multiple files are affected, group them accordingly.

3. **Include relevant details, but keep it concise**  
   - **What changed?** (e.g., updated function, added validation, improved performance, refactored logic)
   - **Why was it changed?** (if evident from the code)
   - **Impact of the change?** (e.g., fixes a bug, improves efficiency, changes API behavior)

4. **Follow a professional commit summary style**  
   - Example format:
     - "Fixed a security vulnerability in authentication flow [\`src/auth.js\`]"
     - "Optimized database query performance by reducing redundant fetch calls [\`server/db.ts\`]"
     - "Refactored logging mechanism to use a structured JSON format [\`logger.ts\`, \`config.ts\`]"

5. **For large commits affecting multiple files**, avoid listing all filenames  
   - Instead, say: "Refactored authentication logic across multiple modules."

---

### **🔹 Example Summaries for Reference**
✅ **Good Summaries:**
- **Bug Fix**: Fixed authentication issue where incorrect passwords were not handled properly [\`auth.js\`]
- **Feature Addition**: Implemented OpenAI API integration for text completion [\`utils/openai.ts\`]
- **Refactoring**: Moved repeated functions to a new helper module [\`helpers.ts\`]
- **Performance Optimization**: Improved caching logic to reduce API calls

❌ **Bad Summaries (Too vague or unstructured):**
- "Updated some files"
- "Changed authentication"
- "Added stuff"
- "Refactored code"

---

### **📌 Now analyze and summarize this Git diff:**
\`\`\`
${diff}
\`\`\`
`;
        const response = await model.generateContent([prompt]);
        

        return response.response.text();
    } catch (error) {
        console.error("Error generating commit summary:", error);
        return "";
    }
};

 export const summariseCode = async (doc: Document): Promise<string> => {
   console.log("🔹 Generating embeddings for source code...");
 
   const codeSnippet = doc.pageContent.slice(0, 10000); // ✅ Limit code snippet size
 
   const prompt = `
     You are a senior developer. Your task is to summarize the following source code 
     for a **junior developer** who is new to this project.
 
     **File Name:** ${doc.metadata.source}
 
     **Code Snippet:**
     -------------------
     ${codeSnippet}
     -------------------
 
     🎯 **Summarization Guidelines:**
     - Explain the purpose and functionality of the code.
     - Keep the summary concise (**max 100 words**).
     - Use clear, simple language.
     - Format the summary as a **single paragraph**.
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