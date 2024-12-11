"use server";

import { db } from "@/db/db";
import { documentsTable } from "@/db/schema";
import { generateEmbeddings } from "../generation/generate-embeddings";
import { splitText } from "./split-text";
import { extractMetadata } from "./extract-metadata";

// Processes a document by splitting it into chunks, generating embeddings, and storing in DB
export async function processDocument(text: string, url: string) {
  try {
    // Extract metadata and clean content
    const metadataResult = await extractMetadata(text);
    if (!metadataResult.isSuccess) {
      throw new Error("Failed to extract metadata");
    }

    // Use cleaned content if available, otherwise fallback to original text
    const contentToProcess = metadataResult.data!.cleanContent || text;
    const chunks = await splitText(contentToProcess);

    // Generate vector embeddings for each text chunk
    const embeddings = await generateEmbeddings(chunks);

    // Store chunks and their embeddings in the database
    await db.insert(documentsTable).values(
      chunks.map((chunk, i) => ({
        content: chunk,
        embedding: embeddings[i],
        title: metadataResult.data!.title,
        author: metadataResult.data!.author,
        topic: metadataResult.data!.topic,
        url,
        publishedAt: metadataResult.data!.publishedAt 
          ? new Date(metadataResult.data!.publishedAt) 
          : null
      }))
    );

    return { success: true };
  } catch (error) {
    console.error("Error processing document:", error);
    throw new Error("Failed to process document");
  }
}
