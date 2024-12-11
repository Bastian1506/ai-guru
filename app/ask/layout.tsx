"use server"

import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { SidebarSkeleton } from "./_components/sidebar-skeleton"
import { Sidebar } from "./_components/sidebar"
import { getChatsByUserIdAction } from "@/actions/db/chats-actions"

export default async function AskLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { userId } = auth()
  if (!userId) {
    throw new Error("User not authenticated")
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <Suspense fallback={<SidebarSkeleton className="w-80 border-r" />}>
        <SidebarFetcher userId={userId} />
      </Suspense>
      <div className="flex-1">{children}</div>
    </div>
  )
}

async function SidebarFetcher({ userId }: { userId: string }) {
  const { data: chats = [] } = await getChatsByUserIdAction(userId)

  return <Sidebar className="w-80 border-r" chats={chats} userId={userId} />
}
