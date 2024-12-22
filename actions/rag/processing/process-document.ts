"use server";

import { db } from "@/db/db";
import { documentsTable, InsertDocument } from "@/db/schema";
import { generateEmbeddings } from "../generation/generate-embeddings";
import { splitText } from "./split-text";
import { extractMetadata } from "./extract-metadata";
import { createContextualChunks } from "./create-contextual-chunks";

export async function processDocument(text: string, url: string) {
  try {
    const metadataResult = await extractMetadata(text);
    
    if (!metadataResult.isSuccess) {
      throw new Error(`Metadata extraction failed: ${metadataResult.message}`);
    }

    const contentToProcess = metadataResult.data!.cleanContent || text;
    
    const chunks = await splitText(contentToProcess);
    const processedChunks = await createContextualChunks(contentToProcess, chunks);
    const embeddings = await generateEmbeddings(processedChunks);

    const documents = processedChunks.map((chunk, i) => ({
      content: chunk,
      embedding: embeddings[i],
      title: metadataResult.data!.title,
      author: metadataResult.data!.author,
      topic: metadataResult.data!.topic,
      url,
      publishedAt: metadataResult.data!.publishedAt 
        ? new Date(metadataResult.data!.publishedAt) 
        : null
    }));

    await db.insert(documentsTable).values(documents as InsertDocument[]);
    return { success: true };
  } catch (error) {
    console.error("Error processing document:", error);
    throw error;
  }
}
