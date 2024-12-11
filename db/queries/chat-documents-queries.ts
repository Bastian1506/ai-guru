"use server"

import { db } from "@/db/db"
import {
  chatDocumentsTable,
  InsertChatDocument,
  SelectChatDocument,
  SelectDocument
} from "@/db/schema"
import { eq, and } from "drizzle-orm"

export const addDocumentToChat = async (
  data: InsertChatDocument
): Promise<SelectChatDocument> => {
  try {
    const [newChatDocument] = await db
      .insert(chatDocumentsTable)
      .values(data)
      .returning()
    return newChatDocument
  } catch (error) {
    console.error("Error adding document to chat:", error)
    throw new Error("Failed to add document to chat")
  }
}

export interface ChatDocument extends SelectChatDocument {
  document: SelectDocument
}

export const getDocumentsByChat = async (
  chatId: string
): Promise<ChatDocument[]> => {
  try {
    return db.query.chatDocuments.findMany({
      where: eq(chatDocumentsTable.chatId, chatId),
      with: {
        document: true
      }
    })
  } catch (error) {
    console.error("Error getting documents:", error)
    throw new Error("Failed to get documents")
  }
}

export const removeDocumentFromChat = async (
  chatId: string,
  documentId: string
): Promise<SelectChatDocument> => {
  try {
    const [deletedChatDocument] = await db
      .delete(chatDocumentsTable)
      .where(
        and(
          eq(chatDocumentsTable.chatId, chatId),
          eq(chatDocumentsTable.documentId, documentId)
        )
      )
      .returning()
    return deletedChatDocument
  } catch (error) {
    console.error("Error removing document from chat:", error)
    throw new Error("Failed to remove document from chat")
  }
}
