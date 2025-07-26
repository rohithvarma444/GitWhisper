"use server";
import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateEmbedding } from "@/lib/gemini";
import { db } from "@/server/db";


const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue();

  const queryVector = await generateEmbedding(question);
  const vectorQuery = queryVector;

  const result = (await db.$queryRaw`
    SELECT "fileName", "sourceCode", "summary",
    1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) >= 0.5
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 10
  `) as { fileName: string; sourceCode: string; summary: string }[];

  let context = "";

  for (const doc of result) {
    context += `Source: ${doc.fileName}\nCode Content: ${doc.sourceCode}\nSummary: ${doc.summary}\n\n`;
  }

const systemPrompt = `
You are a professional software engineer and expert code assistant.

Given the following project context and a developer's question, provide a concise, accurate, and technically sound answer.

Guidelines:
  - Focus only on the developer's question.
  - Base your answer strictly on the provided code context.
  - Use bullet points or structured formatting when helpful.
  - Avoid general advice, greetings, or unnecessary commentary.

---

## Project Code Context
${context}

## Developer Question
${question}

## Answer
`;

  (async () => {
    const { textStream } = await streamText({
      model: google("gemini-2.5-flash"),
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