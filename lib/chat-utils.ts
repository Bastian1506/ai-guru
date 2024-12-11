"use server"

import OpenAI from "openai"

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable")
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function generateChatName(query: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Create a brief, descriptive chat name from this query. Use 2-5 words maximum.

Examples:
- What are the main differences between supervised and unsupervised learning? -> ML Learning Types
- Can you explain how transformers work in deep learning? -> Transformer Architecture
- What's the best way to implement RAG? -> RAG Implementation
- How does ChatGPT handle context? -> ChatGPT Context`
      },
      { role: "user", content: query }
    ],
    temperature: 0.3,
    max_tokens: 10
  })

  return response.choices[0].message.content?.trim() ?? query.slice(0, 30)
}
