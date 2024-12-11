"use server"

import { db } from "@/db/db"
import { chatsTable, InsertChat, SelectChat } from "@/db/schema"
import { eq } from "drizzle-orm"

export const createChat = async (data: InsertChat): Promise<SelectChat> => {
  try {
    const [newChat] = await db.insert(chatsTable).values(data).returning()
    return newChat
  } catch (error) {
    console.error("Error creating chat:", error)
    throw new Error("Failed to create chat")
  }
}

export const getChatsByUserId = async (
  userId: string
): Promise<SelectChat[]> => {
  try {
    return db.query.chats.findMany({
      where: eq(chatsTable.userId, userId),
      orderBy: chats => chats.updatedAt
    })
  } catch (error) {
    console.error("Error getting chats:", error)
    throw new Error("Failed to get chats")
  }
}

export const deleteChat = async (id: string): Promise<SelectChat> => {
  try {
    const [deletedChat] = await db
      .delete(chatsTable)
      .where(eq(chatsTable.id, id))
      .returning()
    return deletedChat
  } catch (error) {
    console.error("Error deleting chat:", error)
    throw new Error("Failed to delete chat")
  }
}

export const updateChat = async (
  id: string,
  data: Partial<InsertChat>
): Promise<SelectChat> => {
  try {
    const [updated] = await db
      .update(chatsTable)
      .set(data)
      .where(eq(chatsTable.id, id))
      .returning()
    return updated
  } catch (error) {
    console.error("Error updating chat:", error)
    throw new Error("Failed to update chat")
  }
}
