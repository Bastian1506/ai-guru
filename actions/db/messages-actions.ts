"use server"

import { getMessagesByChat } from "@/db/queries/messages-queries"
import { SelectMessage } from "@/db/schema"
import { ActionState } from "@/types"
import { createMessage } from "@/db/queries/messages-queries"
import { InsertMessage } from "@/db/schema"
import { revalidatePath } from "next/cache"
import { updateMessage } from "@/db/queries/messages-queries"

export async function getChatMessagesAction(
  chatId: string
): Promise<ActionState<SelectMessage[]>> {
  try {
    const messages = await getMessagesByChat(chatId)
    return {
      isSuccess: true,
      message: "Messages retrieved successfully",
      data: messages
    }
  } catch (error) {
    console.error("Error getting messages:", error)
    return { isSuccess: false, message: "Failed to get messages" }
  }
}

export async function createMessageAction(
  message: Partial<InsertMessage>
): Promise<ActionState<SelectMessage>> {
  try {
    const newMessage = await createMessage(message as InsertMessage)
    revalidatePath("/ask")
    return { isSuccess: true, message: "Message created", data: newMessage }
  } catch (error) {
    return { isSuccess: false, message: "Failed to create message" }
  }
}

export async function updateMessageAction(
  id: string,
  content: string
): Promise<ActionState<SelectMessage>> {
  try {
    const updatedMessage = await updateMessage(id, content)
    revalidatePath("/ask")
    return { isSuccess: true, message: "Message updated", data: updatedMessage }
  } catch (error) {
    return { isSuccess: false, message: "Failed to update message" }
  }
} 