"use server"

import OpenAI from "openai"
import { SituatedContext } from "@/types/rag-types"
import { splitText } from "./split-text"

const openai = new OpenAI()

async function situateContext(doc: string, chunk: string): Promise<SituatedContext> {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that provides succinct context for document chunks. Return responses in JSON format with 'title' and 'context' fields."
      },
      {
        role: "user",
        content: `Document: ${doc}\n\nChunk: ${chunk}\n\nPlease provide a short succinct context to situate this chunk within the overall document for improving search retrieval. Return as JSON with 'title' and 'context' fields.`
      }
    ],
    response_format: { type: "json_object" }
  })

  return JSON.parse(response.choices[0].message.content!) as SituatedContext
}

async function processChunk(doc: string, chunk: string): Promise<string> {
  const context = await situateContext(doc, chunk)
  // Combine context and chunk with a clear separator
  return `[CONTEXT] ${context.context} [CONTENT] ${chunk}`
}

export async function createContextualChunks(doc: string, chunks: string[]): Promise<string[]> {
  try {
    const processedChunks = await Promise.all(
      chunks.map(chunk => processChunk(doc, chunk))
    )

    return processedChunks
  } catch (error) {
    console.error("Error creating contextual chunks:", error)
    throw new Error(`Failed to create contextual chunks: ${error instanceof Error ? error.message : String(error)}`)
  }
} 