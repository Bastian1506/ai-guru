"use server"

import { auth } from "@clerk/nextjs/server"
import { ChatArea } from "./_components/chat-area"

export default async function AskPage() {
  const { userId } = auth()
  if (!userId) {
    throw new Error("User not authenticated")
  }
  return (
    <ChatArea
      initialDocuments={[]}
      initialMessages={[]}
      userId={userId}
      chatId={""}
    />
  )
}
