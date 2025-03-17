import { streamText } from 'ai'
import { createStreamableValue } from 'ai/rsc'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateEmbedding } from '@/lib/gemini'


const google = createGoogleGenerativeAI({
    apiKey: 'AIzaSyAmKDxAeINhTQbR3lrrUnE5rh5NWVUswHQ'
})

export const askQuestion = async (question: string, projectId: string) => {
    const stream = createStreamableValue()

    const vectorQuery = await generateEmbedding(question)
    const result = await db.$executeRaw`
    SELECT "fileName", "sourceCode", "summary",
    1 - ("summaryEmbedding" <-> ${vectorQuery}) as similarity
    FROM "SourceCodeEmbedding"
    WHERE 1 - ("summaryEmbedding" <-> ${vectorQuery}) > 0.5
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 10` as { fileName: string, sourceCode: string, summary: string, similarity: number }[]

    let context = ''

    for (const doc of result) {
        context += `📂 Source: ${doc.fileName}\n📝 Code:\n${doc.sourceCode}\n🔍 Summary: ${doc.summary}\n\n`
    }

    const systemPrompt = `
        You are an extremely helpful AI assistant. You are mentoring an intern who is working on a project.
        Your responses should be **friendly, encouraging, and motivating**.
        Provide **clear, well-structured, and easy-to-understand** explanations.
        If the intern is stuck, offer **helpful debugging suggestions** and motivate them to keep going.

        Context from the project:
        ${context}

        Question: "${question}"
        
        🔹 **Your task**: Provide an answer in a **helpful and friendly manner**, guiding the intern toward a solution.
        🔹 **Encourage them to think through the problem** but offer direct help when necessary.
    `

    const responseStream = await google.generateTextStream({
        prompt: systemPrompt,
        model: 'geimni-1.5-flash'
    })

    stream.append(responseStream)

    return new StreamText(stream)
}