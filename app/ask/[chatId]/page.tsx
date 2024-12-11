"use server"

import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { ChatArea } from "../_components/chat-area"
import { ChatSkeleton } from "../_components/chat-skeleton"
import { getChatMessagesAction } from "@/actions/db/messages-actions"
import { getDocumentsByChatAction } from "@/actions/db/chat-documents-actions"

export default async function ChatPage({
  params
}: {
  params: { chatId: string }
}) {
  const { userId } = auth()
  if (!userId) {
    throw new Error("User not authenticated")
  }
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ChatFetcher chatId={params.chatId} userId={userId} />
    </Suspense>
  )
}

async function ChatFetcher({
  chatId,
  userId
}: {
  chatId: string
  userId: string
}) {
  const [messagesResponse, documentsResponse] = await Promise.all([
    getChatMessagesAction(chatId),
    getDocumentsByChatAction(chatId)
  ])

  console.log("Raw documents response:", documentsResponse)
  console.log("Documents data:", documentsResponse.data)
  console.log(
    "Mapped documents:",
    (documentsResponse.data || []).map(cd => cd.document)
  )

  return (
    <ChatArea
      userId={userId}
      chatId={chatId}
      initialMessages={messagesResponse.data || []}
      initialDocuments={(documentsResponse.data || []).map(cd => cd.document)}
    />
  )
}
