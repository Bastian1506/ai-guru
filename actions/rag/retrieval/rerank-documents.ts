"use server";

import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY
});

// Re-ranks documents using Cohere's reranking model for more accurate relevance scoring
export async function rankDocuments(
  query: string, 
  documents: { 
    content: string, 
    id: string, 
    title: string,
    url: string, 
    author: string, 
    topic: string, 
    publishedAt: string 
  }[], 
  limit = 3
) {
  // Call Cohere's rerank API to score and reorder documents based on relevance to query
  const rerank = await cohere.v2.rerank({
    documents: documents.map((doc) => doc.content), // Just pass content strings
    query,
    topN: limit, // Number of top results to return
    model: "rerank-english-v3.0" // Latest English reranking model
  });

  // Map reranked results back to original document format with relevance scores
  return rerank.results.map((result) => ({
    id: documents[result.index].id,
    title: documents[result.index].title,
    url: documents[result.index].url,
    author: documents[result.index].author,
    topic: documents[result.index].topic,
    publishedAt: documents[result.index].publishedAt,
    content: documents[result.index].content,
    relevanceScore: result.relevanceScore // Score indicating relevance
  }));
}
