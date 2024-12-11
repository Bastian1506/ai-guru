"use server"

import { getDocumentsByChat } from "@/db/queries/documents-queries"
import { SelectDocument } from "@/db/schema"
import { ActionState } from "@/types"
import { ChatDocument } from "@/db/queries/chat-documents-queries"

export async function getChatDocumentsAction(
  chatId: string
): Promise<ActionState<ChatDocument[]>> {
  try {
    const documents = await getDocumentsByChat(chatId)
    return {
      isSuccess: true,
      message: "Documents retrieved successfully",
      data: documents
    }
  } catch (error) {
    console.error("Error getting documents:", error)
    return { isSuccess: false, message: "Failed to get documents" }
  }
} 