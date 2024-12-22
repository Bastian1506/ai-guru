'use server'

import { ActionState } from "@/types"
import {createStreamableValue, StreamableValue} from "ai/rsc"
import {streamText} from "ai"
import { openai } from "@ai-sdk/openai";
import { SelectMessage } from "@/db/schema"

// Add interface for chat history
interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

// Add a function to check if we need more context
export async function checkNeedMoreContext(
  context: string,
  input: string,
  chatHistory: SelectMessage[]
): Promise<boolean> {
  try {
    const messages: ChatMessage[] = chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }))

    messages.push({
      role: "user",
      content: input
    })

    const EVALUATION_PROMPT = `Given the following context and question, determine if the available information is sufficient to provide a complete and accurate answer. Respond with either "SUFFICIENT" or "NEED_MORE_INFO".

Context from documents:
<context>
${context}
</context>

Question: ${input}

Consider:
1. Is the specific topic of the question covered in the context?
2. Are key details needed to answer the question present?
3. Would additional information significantly improve the answer quality?`

    const { textStream } = await streamText({
      model: openai("gpt-4o-mini"),
      system: EVALUATION_PROMPT,
      messages: [{ role: "user", content: "Evaluate if context is sufficient." }]
    })

    let response = ""
    for await (const chunk of textStream) {
      response += chunk
    }

    return response.includes("NEED_MORE_INFO")
  } catch (error) {
    console.error("Error checking context sufficiency:", error)
    return false
  }
}

// Takes context and user input, returns AI completion incorporating the context
export async function generateCompletionWithContext(
  context: string, 
  input: string,
  chatHistory: SelectMessage[] // Add chat history parameter
): Promise<ActionState<StreamableValue<any, any>>> {
  try {
    const stream = createStreamableValue();

    // Format chat history into messages array
    const messages: ChatMessage[] = chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }))

    // Add current user input
    messages.push({
      role: "user",
      content: input
    })

    const SYSTEM_PROMPT = `You are a helpful assistant that answers questions about AI based on factual information. Your task is to provide accurate and informative responses using the following context and chat history.

Context from relevant documents:
<ai_facts>
${context}
</ai_facts>

When answering questions:
1. Use both the context and the chat history to provide comprehensive answers
2. If referring to previous messages, be explicit about what you're referring to
3. If the question cannot be answered using the context or chat history, state that clearly. If the question contains a date, it is only related to the publication date of the document and thus the metadata filtering, but not about the content of the document. So it is not relevant to the answer. Just answer the question, without taking the date into account.
4. Stay focused on the topic and maintain continuity with previous messages
5. Do not make up information not present in the context or chat history`

    ;(async () => {
      const {textStream} = await streamText({
        model: openai("gpt-4o"),
        system: SYSTEM_PROMPT,
        messages: messages // Pass the full message history
      })

      for await (const chunk of textStream) {
        stream.update(chunk)
      }

      stream.done()
    })()

    // Extract and return just the completion text
    return {
      isSuccess: true,
      message: "Completion generated successfully",
      data: stream.value
    };
  } catch (error) {
    console.error("Error generating OpenAI response:", error);
    return {
      isSuccess: false,
      message: "Failed to generate OpenAI response"
    };
  }
}

