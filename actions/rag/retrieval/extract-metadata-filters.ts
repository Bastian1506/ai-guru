"use server"

import { z } from "zod"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { ActionState } from "@/types"

const MetadataFiltersSchema = z.object({
  title: z.string().describe("Only return the title if it's mentioned explicitly that the title of the document is the returned title.").nullable(),
  author: z.string().describe("Only return the author if it's mentioned explicitly that the author of the document is the returned author.").nullable(),
  topic: z.enum(["RAG", "Agents", "Strategy", "Evaluation", "Deployment", "Observability"]).describe("One of the mentioned topics. Classify the topic based on the query. If you are unsure, return null.").nullable(),
  publishedAt: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .transform((date) => date ? new Date(date) : null)
    .nullable()
    .describe("Return in ISO 8601 format (YYYY-MM-DD). Return only the date, when it's mentioned explicitly that the document must be published after a certain date.")
})

type MetadataFilters = z.infer<typeof MetadataFiltersSchema>

const filterExtractionPrompt = `Extract search filters from a natural language query. Return only relevant filters, with null for any that aren't mentioned explicitly.`

export async function extractMetadataFilters(query: string): Promise<ActionState<MetadataFilters>> {
  try {
    const { object: filters } = await generateObject({
      model: openai("gpt-4o-2024-08-06"),
      schema: MetadataFiltersSchema,
      prompt: `${filterExtractionPrompt}\n\nQuery: ${query}`
    })

    return {
      isSuccess: true,
      message: "Successfully extracted filters",
      data: filters
    }

  } catch (error) {
    console.error("Error extracting filters:", error)
    return {
      isSuccess: false,
      message: `Failed to extract filters: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}