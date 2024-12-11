"use server"

import { db } from "@/db/db"
import { chatDocumentsTable, documentsTable } from "@/db/schema"
import { eq } from "drizzle-orm"

export const getDocumentsByChat = async (chatId: string) => {
  try {
    return await db.query.chatDocuments.findMany({
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
