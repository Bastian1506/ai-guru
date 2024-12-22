"use server";

import { getOptimizedQuery } from "./optimize-query";
import { rankDocuments } from "./rerank-documents";
import { retrieveDocuments } from "./retrieve-documents";
import { ActionState } from "@/types";
import { RankedDocument } from "./rerank-documents";

export async function runRagPipeline(
  query: string,
  options = { vectorLimit: 20, keywordLimit: 20, rerankLimit: 5 }
): Promise<ActionState<{results: RankedDocument[]}>> {
  try {
    const optimizedQuery = await getOptimizedQuery(query);
    console.log("Optimized query:", optimizedQuery);
    const retrievedDocs = await retrieveDocuments(optimizedQuery, { 
      vectorLimit: options.vectorLimit,
      keywordLimit: options.keywordLimit 
    });
    console.log("Retrieved documents count:", retrievedDocs.length);
    if (!retrievedDocs?.length) {
      return {
        isSuccess: false,
        message: "No relevant documents found",
        data: { results: [] }
      }
    }
    const rankedResults = await rankDocuments(optimizedQuery, retrievedDocs, options.rerankLimit);
    return {
      isSuccess: true,
      message: "RAG pipeline completed successfully",
      data: { results: rankedResults }
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
