"use server";

import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY
});

export interface Document {
  id: string
  title: string
  url: string
  author: string
  topic: string
  publishedAt: Date | null
  content: string
  score: number
}

export interface RankedDocument extends Document {
  relevanceScore: number
  initialScore: number
}

export async function rankDocuments(
  query: string, 
  documents: Document[], 
  limit = 10
): Promise<RankedDocument[]> {
  try {
    // Rerank using Cohere's rerank endpoint
    const rerank = await cohere.v2.rerank({
      documents: documents.map(doc => doc.content),
      query,
      topN: limit,
      model: "rerank-english-v3.0"
    });

    // Map reranked results back to original document format
    return rerank.results.map(result => {
      const originalDoc = documents[result.index];
      return {
        ...originalDoc,
        relevanceScore: result.relevanceScore,
        // Include both scores for debugging/analysis
        initialScore: originalDoc.score
      };
    });
  } catch (error) {
    console.error("Error in reranking:", error);
    // Fallback to original scoring if reranking fails
    return documents
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(doc => ({
        ...doc,
        relevanceScore: 0,
        initialScore: doc.score
      }));
  }
}
