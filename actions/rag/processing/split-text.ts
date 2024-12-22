"use server";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function splitText(text: string) {
  const splitter = new RecursiveCharacterTextSplitter({
    separators: ["\n\n", "\n", ".", "?", "!", " ", ""],
    chunkSize: 800,
    chunkOverlap: 400,
    lengthFunction: (text) => text.length,
  });

  try {
    const docs = await splitter.createDocuments([text]);
    const chunks = docs.map(doc => doc.pageContent);

    return chunks;
  } catch (error) {
    console.error("Error splitting text:", error);
    throw new Error(`Failed to split text: ${error instanceof Error ? error.message : String(error)}`);
  }
}
