"use server"

import { z } from "zod"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { extractMetadataPrompt } from "@/prompts/extract-metadata-prompt"
import { ActionState } from "@/types"

const MetadataSchema = z.object({
  title: z.string(),
  author: z.string(),
  topic: z.enum(["RAG", "Agents", "Strategy", "Evaluation", "Deployment", "Observability", "Other"]),
  publishedAt: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .transform((date) => date ? new Date(date) : null)
    .nullable(),
  cleanContent: z.string()
})

type Metadata = z.infer<typeof MetadataSchema>

export async function extractMetadata(text: string): Promise<ActionState<Metadata>> {
  try {
    const { object: metadata } = await generateObject({
      model: openai("gpt-4o-2024-08-06"),
      schema: MetadataSchema,
      prompt: `${extractMetadataPrompt}\n\nContent to analyze:\n\n${text}`
    })

    return {
      isSuccess: true,
      message: "Successfully extracted metadata",
      data: metadata
    }

  } catch (error) {
    console.error("Error extracting metadata:", error)
    return {
      isSuccess: false,
      message: `Failed to extract metadata: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}