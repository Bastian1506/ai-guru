"use server";

import { getOptimizedQuery } from "./optimize-query";
import { rankDocuments } from "./rerank-documents";
import { retrieveDocuments } from "./retrieve-documents";
import { ActionState } from "@/types";

export async function runRagPipeline(query: string): Promise<ActionState<{results:{
  id: string, 
  title: string,
  url: string, 
  author: string, 
  topic: string, 
  publishedAt: string, 
  content: string
}[]}>> {
  try {
    // 1. Optimize query
    const optimizedQuery = await getOptimizedQuery(query);
    
    // 2. Retrieve docs
    const retrievedDocs = await retrieveDocuments(optimizedQuery, {
      limit: 10
    });

    // Check if we got documents
    if (!retrievedDocs || retrievedDocs.length === 0) {
      return {
        isSuccess: false,
        message: "No relevant documents found",
        data: { results: [] }
      }
    }

    // 3. Rerank only if we have docs
    const rankedResults = await rankDocuments(optimizedQuery, retrievedDocs as any, 3);
    return {
      isSuccess: true,
      message: "RAG pipeline completed successfully",
      data: {
        results: rankedResults.map((result: any) => ({
          id: result.id,
          title: result.title,
          url: result.url, 
          author: result.author,
          topic: result.topic,
          publishedAt: result.publishedAt,
          content: result.content
        }))
      }
    }

  } catch (error) {
    console.error("RAG Pipeline Error:", error);
    return {
      isSuccess: false,
      message: "Failed to process query",
      data: { results: [] }
    }
  }
}
