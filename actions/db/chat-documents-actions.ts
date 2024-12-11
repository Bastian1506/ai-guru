"use server"

import { 
  addDocumentToChat, 
  getDocumentsByChat, 
  removeDocumentFromChat,
  ChatDocument
} from "@/db/queries/chat-documents-queries"
import { InsertChatDocument, SelectChatDocument } from "@/db/schema"
import { ActionState } from "@/types"
import { revalidatePath } from "next/cache"

export async function addDocumentToChatAction(
  data: InsertChatDocument
): Promise<ActionState<SelectChatDocument>> {
  try {
    const newChatDocument = await addDocumentToChat(data)
    revalidatePath("/")
    return {
      isSuccess: true,
      message: "Document added to chat successfully",
      data: newChatDocument
    }
  } catch (error) {
    console.error("Error adding document to chat:", error)
    return { isSuccess: false, message: "Failed to add document to chat" }
  }
}

export async function getDocumentsByChatAction(
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

export async function removeDocumentFromChatAction(
  chatId: string,
  documentId: string
): Promise<ActionState<SelectChatDocument>> {
  try {
    const removedDocument = await removeDocumentFromChat(chatId, documentId)
    revalidatePath("/")
    return {
      isSuccess: true,
      message: "Document removed from chat successfully",
      data: removedDocument
    }
  } catch (error) {
    console.error("Error removing document from chat:", error)
    return { isSuccess: false, message: "Failed to remove document from chat" }
  }
} 