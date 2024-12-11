"use server"

import { createChat, getChatsByUserId, deleteChat, updateChat } from "@/db/queries/chats-queries"
import { InsertChat, SelectChat } from "@/db/schema"
import { ActionState } from "@/types"
import { revalidatePath } from "next/cache"


export async function createChatAction(
  chat: InsertChat
): Promise<ActionState<SelectChat>> {
  try {
    const newChat = await createChat(chat)
    revalidatePath("/")
    return {
      isSuccess: true,
      message: "Chat created successfully",
      data: newChat
    }
  } catch (error) {
    console.error("Error creating chat:", error)
    return { isSuccess: false, message: "Failed to create chat" }
  }
}

export async function getChatsByUserIdAction(
  userId: string
): Promise<ActionState<SelectChat[]>> {
  try {
    const chats = await getChatsByUserId(userId)
    return {
      isSuccess: true,
      message: "Chats retrieved successfully",
      data: chats
    }
  } catch (error) {
    console.error("Error getting chats:", error)
    return { isSuccess: false, message: "Failed to get chats" }
  }
}

export async function deleteChatAction(
  id: string
): Promise<ActionState<SelectChat>> {
  try {
    const deletedChat = await deleteChat(id)
    revalidatePath("/")
    return {
      isSuccess: true,
      message: "Chat deleted successfully",
      data: deletedChat
    }
  } catch (error) {
    console.error("Error deleting chat:", error)
    return { isSuccess: false, message: "Failed to delete chat" }
  }
}

export async function updateChatAction(
  id: string, 
  data: Partial<InsertChat>
): Promise<ActionState<SelectChat>> {
  try {
    const updated = await updateChat(id, data)
    revalidatePath("/")
    return {
      isSuccess: true,
      message: "Chat updated successfully",
      data: updated
    }
  } catch (error) {
    console.error("Error updating chat:", error)
    return { isSuccess: false, message: "Failed to update chat" }
  }
} 