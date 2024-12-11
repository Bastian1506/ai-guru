"use server";

import { get_encoding } from "tiktoken";

// Splits input text into chunks of roughly equal token size for processing
export async function splitText(text: string) {
  const chunks: string[] = [];
  // Target size for each chunk in tokens
  const CHUNK_SIZE = 500;
  // Initialize tokenizer using OpenAI's cl100k_base encoding
  const encoding = get_encoding("cl100k_base");

  try {
    // Convert text to token IDs
    const tokens = encoding.encode(text);

    // Split tokens into chunks of CHUNK_SIZE
    for (let i = 0; i < tokens.length; i += CHUNK_SIZE) {
      // Get subset of tokens for this chunk
      const chunkTokens = tokens.slice(i, i + CHUNK_SIZE);
      // Convert token IDs back to text
      const chunk = new TextDecoder().decode(encoding.decode(chunkTokens));
      chunks.push(chunk);
    }

    return chunks;
  } finally {
    // Clean up tokenizer resources
    encoding.free();
  }
}
