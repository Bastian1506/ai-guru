"use server"

import { db } from "@/db/db";
import { documentsTable } from "@/db/schema/documents-schema";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { generateEmbeddings } from "../generation/generate-embeddings";

interface RetrieveOptions {
  limit?: number;
  minSimilarity?: number;
}

// Retrieves relevant documents from the database based on semantic similarity to input text
export async function retrieveDocuments(input: string, options: RetrieveOptions = {}) {
  const { limit = 10, minSimilarity = 0.3 } = options;

  // Generate vector embedding for input text
  const embeddings = await generateEmbeddings([input]);
  const similarity = sql<number>`1 - (${cosineDistance(documentsTable.embedding, embeddings[0])})`;

  const documents = await db
    .select({
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
    .where(gt(similarity, minSimilarity))
    .orderBy(desc(similarity))
    .limit(limit);

  return documents;
}
