"use server"

import { db } from "@/db/db"
import { InsertMessage, SelectMessage, messagesTable } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function createMessage(
  data: InsertMessage
): Promise<SelectMessage> {
  try {
    const [newMessage] = await db.insert(messagesTable).values(data).returning()
    return newMessage
  } catch (error) {
    console.error("Error creating message:", error)
    throw new Error("Failed to create message")
  }
}

export async function getMessagesByChat(
  chatId: string
): Promise<SelectMessage[]> {
  try {
    return db.query.messages.findMany({
      where: eq(messagesTable.chatId, chatId),
      orderBy: messagesTable.createdAt
    })
  } catch (error) {
    console.error("Error getting messages:", error)
    throw new Error("Failed to get messages")
  }
}

export async function updateMessage(
  id: string,
  content: string
): Promise<SelectMessage> {
  try {
    const [updatedMessage] = await db
      .update(messagesTable)
      .set({ content, updatedAt: new Date() })
      .where(eq(messagesTable.id, id))
      .returning()
    return updatedMessage
  } catch (error) {
    console.error("Error updating message:", error)
    throw new Error("Failed to update message")
  }
}
