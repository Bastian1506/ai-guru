"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { extractMetadataPrompt } from "@/prompts/extract-metadata-prompt"
import { ActionState } from "@/types"

interface Metadata {
  title: string
  author: string
  topic: "RAG" | "Agents" | "Strategy" | "evaluation" | "deployment"
  publishedAt: string | null
  cleanContent: string
}

export async function extractMetadata(text: string): Promise<ActionState<Metadata>> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const result = await model.generateContent([
      extractMetadataPrompt,
      `Here's the document to analyze:\n\n${text}`
    ])
    const response = result.response.text()
    
    const metadata = JSON.parse(response) as Metadata

    return {
      isSuccess: true,
      message: "Successfully extracted metadata",
      data: metadata
    }
  } catch (error) {
    console.error("Error extracting metadata:", error)
    return {
      isSuccess: false,
      message: "Failed to extract metadata",
      data: {
        title: "AI Guru Writer",
        author: "AI Guru Writer",
        topic: "RAG",
        publishedAt: null,
        cleanContent: text
      }
    }
  }
} 