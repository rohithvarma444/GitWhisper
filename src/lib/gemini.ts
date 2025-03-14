import { GoogleGenerativeAI } from '@google/generative-ai';

const gemini = new GoogleGenerativeAI("AIzaSyAmKDxAeINhTQbR3lrrUnE5rh5NWVUswHQ");
const model = gemini.getGenerativeModel({
    model: 'gemini-1.5-flash'
});

export const aiSummariseCommit = async (diff: string) => {
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
        return "Failed to summarize commit.";
    }
};


summariseCommit(`
    diff --git a/prisma/schema.prisma b/prisma/schema.prisma
    index 75ef225..f8592fc 100644
    --- a/prisma/schema.prisma
    +++ b/prisma/schema.prisma
    @@ -20,4 +20,32 @@ model User{
     
         createdAt      DateTime @default(now())
         updatedAt      DateTime @updatedAt
    +
    +    UserToProject  UserToProject[]
    +}
    +
    +model Project{
    +    id          String @id @unique @default(cuid()) 
    +    name        String 
    +    githubUrl   String
    +
    +    deletedAt   DateTime?
    +    createdAt   DateTime @default(now())
    +    updatedAt   DateTime @updatedAt
    +
    +    UserToProject  UserToProject[]
    +}
    +
    +model UserToProject {
    +    id          String   @id @default(cuid()) 
    +    createdAt   DateTime @default(now())
    +    updatedAt   DateTime @updatedAt
    +
    +    userId      String
    +    projectId   String
    +
    +    user        User    @relation(fields: [userId], references: [id])
    +    project     Project @relation(fields: [projectId], references: [id])
    +
    +    @@unique([userId, projectId])
     }
    ...
    `)
      .then(console.log)  // Logs the resolved summary
      .catch(console.error);  // Logs any errors encountered