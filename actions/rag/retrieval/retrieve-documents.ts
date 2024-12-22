"use server"

import { db } from "@/db/db";
import { documentsTable } from "@/db/schema";
import { and, desc, gt, sql, cosineDistance, or } from "drizzle-orm";
import { generateEmbeddings } from "../generation/generate-embeddings";
import { extractMetadataFilters } from "./extract-metadata-filters";

interface RetrieveOptions {
  vectorLimit?: number;
  keywordLimit?: number;
  minSimilarity?: number;
}

export async function retrieveDocuments(input: string, options: RetrieveOptions = {}) {
  const { vectorLimit = 20, keywordLimit = 20, minSimilarity = 0.3 } = options;

  const filtersResult = await extractMetadataFilters(input);
  if (!filtersResult.isSuccess || !filtersResult.data) {
    console.error("Failed to extract filters:", filtersResult.message);
    filtersResult.data = {
      title: null,
      author: null,
      topic: null,
      publishedAt: null
    };
  }
  console.log('Extracted filters:', JSON.stringify(filtersResult.data, null, 2));
  
  const filters = filtersResult.data;
  const embeddings = await generateEmbeddings([input]);
  
  // Vector similarity calculation
  const similarity = sql<number>`1 - (${cosineDistance(documentsTable.embedding, embeddings[0])})`;
  const [vectorResults, keywordResults] = await Promise.all([
    // Vector search with metadata filters
    db.select({
      id: documentsTable.id,
      title: documentsTable.title,
      url: documentsTable.url,
      author: documentsTable.author,
      topic: documentsTable.topic,
      publishedAt: documentsTable.publishedAt,
      content: documentsTable.content,
      similarity
    })
    .from(documentsTable)
    .where(
      and(
        gt(similarity, minSimilarity),
        //filters.title ? sql`LOWER(${documentsTable.title}) LIKE LOWER(${`%${filters.title}%`})` : undefined,
        filters.author ? sql`LOWER(${documentsTable.author}) LIKE LOWER(${`%${filters.author}%`})` : undefined,
        //filters.topic ? sql`${documentsTable.topic} = ${filters.topic}` : undefined,
        //filters.publishedAt ? gt(documentsTable.publishedAt, filters.publishedAt) : undefined
      )
    )
    .orderBy(desc(similarity))
    .limit(vectorLimit),

    // Keyword search using CTE
    (() => {
      const keywordQuery = db.$with('matched_docs').as(
        db.select({
          id: documentsTable.id,
          title: documentsTable.title,
          url: documentsTable.url,
          author: documentsTable.author,
          topic: documentsTable.topic,
          publishedAt: documentsTable.publishedAt,
          content: documentsTable.content,
          rank: sql<number>`ts_rank_cd(${documentsTable.search_vector}, websearch_to_tsquery('english', ${input}))`.as('rank')
        })
        .from(documentsTable)
        .where(
          and(
            sql`${documentsTable.search_vector} @@ websearch_to_tsquery('english', ${input})`,
            //filters.title ? sql`LOWER(${documentsTable.title}) LIKE LOWER(${`%${filters.title}%`})` : undefined,
            filters.author ? sql`LOWER(${documentsTable.author}) LIKE LOWER(${`%${filters.author}%`})` : undefined,
            //filters.topic ? sql`${documentsTable.topic} = ${filters.topic}` : undefined,
            //filters.publishedAt ? gt(documentsTable.publishedAt, filters.publishedAt) : undefined
          )
        )
      );

      return db.with(keywordQuery)
        .select()
        .from(keywordQuery)
        .orderBy(desc(keywordQuery.rank))
        .limit(keywordLimit);
    })()
  ]);

  // Combine and deduplicate results
  const seenIds = new Set<string>();
  const combinedResults = [];

  // Add vector results first
  for (const result of vectorResults as any[]) {
    if (!seenIds.has(result.id)) {
      seenIds.add(result.id);
      combinedResults.push({
        ...result,
        score: result.similarity
      });
    }
  }

  // Add keyword results
  for (const result of keywordResults as any[]) {
    if (!seenIds.has(result.id)) {
      seenIds.add(result.id);
      combinedResults.push({
        ...result,
        score: result.rank
      });
    }
  }

  // Sort by score and take top results
  return combinedResults
    .sort((a, b) => b.score - a.score)
    .slice(0, vectorLimit);
}
