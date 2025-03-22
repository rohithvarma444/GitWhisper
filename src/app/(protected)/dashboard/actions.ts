"use server";
import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateEmbedding } from "@/lib/gemini";
import { db } from "@/server/db";

const google = createGoogleGenerativeAI({
  apiKey: "AIzaSyAmKDxAeINhTQbR3lrrUnE5rh5NWVUswHQ",
});

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue();

  const queryVector = await generateEmbedding(question);
  const vectorQuery = queryVector

  const result = (await db.$queryRaw`
    SELECT "fileName", "sourceCode", "summary",
    1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 10
  `) as { fileName: string; sourceCode: string; summary: string }[];

  let context = "";

  for (const doc of result) {
    context += `Source: ${doc.fileName}\nCode Content: ${doc.sourceCode}\nSummary: ${doc.summary}\n\n`;
  }

  const systemPrompt = `
You are a senior software developer mentoring an intern at a technology company. 
The intern is currently working on a software development project and has limited experience with coding best practices, debugging, and architectural decisions.

Your goal is to **explain the code** in a **clear, step-by-step manner** based on the intern’s question.
The explanation should help the intern **understand the logic, structure, and purpose** of the code.

### Guidelines for Your Response:
1. **Begin with an overview** of the concept relevant to the question.
2. **Break the code down into small, easy-to-understand steps.**
3. **Use simple terms and analogies** to make complex topics accessible.
4. **Provide real-world examples** where applicable.
5. **Highlight common mistakes and debugging tips** to help the intern troubleshoot issues.
6. **Encourage critical thinking** while ensuring the intern feels supported.

---

### Project Context:
${context}

### Intern’s Question: 
"${question}"

### Your Response:
- **Clearly explain the code** while keeping it beginner-friendly.
- **Provide insights into why the code is structured the way it is.**
- **Suggest improvements or best practices**, if applicable.
- **If the code is incorrect or inefficient, guide the intern toward the correct approach.**
- **End with an encouraging note**, reminding the intern that learning to code takes time and practice.

Your response should be **educational, structured, and easy to follow.** The goal is to help the intern **gain confidence and a deeper understanding of the code.**
`;

  (async () => {
    const { textStream } = await streamText({
      model: google("gemini-1.5-flash"),
      prompt: systemPrompt,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return {
    output: stream.value,
    fileReference: result,
  };
}