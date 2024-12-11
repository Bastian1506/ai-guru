"use server"

import { SelectMessage } from "@/db/schema"
import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function getOptimizedQuery(query: string, chatHistory?: SelectMessage[]): Promise<string> {
  try {
    const OPTIMIZATION_PROMPT = `You are an AI assistant tasked with optimizing queries for a RAG (Retrieval-Augmented Generation) system. Your goal is to create effective search queries that will retrieve the most relevant information.

${chatHistory?.length ? `Context from previous messages:
${chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Follow-up question: ${query}` : `Original query: ${query}`}

Follow these guidelines to create an optimized search query:

1. For initial questions:
   - Remove unnecessary words while preserving core meaning
   - Identify and emphasize key concepts or entities
   - Use specific or technical terms when appropriate
   - Ensure clarity and conciseness

2. For follow-up questions:
   - Incorporate relevant context from chat history
   - Make the question self-contained
   - Include key terms from previous related messages
   - Focus on the new information being requested

3. General optimization:
   - Prioritize technical and domain-specific terminology
   - Include synonyms for important concepts
   - Maintain the original intent
   - Format for maximum relevance in vector search

Examples:
Initial queries:
- "What is transformer architecture?" -> "transformer architecture neural networks attention mechanism"
- "Explain RAG in AI" -> "retrieval augmented generation RAG LLM implementation details"

Follow-up queries:
- After discussing LLMs: "How does fine-tuning work?" -> "language model LLM fine-tuning training process methodology"
- After GPT context: "What about the attention mechanism?" -> "GPT transformer attention mechanism self-attention implementation details"

Return only the optimized query text, without any explanation.`

    const { textStream } = await streamText({
      model: openai("gpt-4o-mini"),
      system: OPTIMIZATION_PROMPT,
      messages: [{ role: "user", content: "Generate optimized query." }]
    })

    let optimizedQuery = ""
    for await (const chunk of textStream) {
      optimizedQuery += chunk
    }

    return optimizedQuery.trim()
  } catch (error) {
    console.error("Error optimizing query:", error)
    return query // Fall back to original query if optimization fails
  }
}
