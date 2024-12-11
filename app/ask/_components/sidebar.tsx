"use client"

import { useState } from "react"
import { SelectChat } from "@/db/schema"
import { Button } from "@/components/ui/button"
import { Plus, Trash } from "lucide-react"
import { createChatAction, deleteChatAction } from "@/actions/db/chats-actions"
import Link from "next/link"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import { processDocument } from "@/actions/rag/processing/process-document"
import { fetchMarkdownAction } from "@/actions/rag/processing/fetch-markdown-action"
import { useRouter } from "next/navigation"

interface SidebarProps {
  className?: string
  chats: SelectChat[]
  userId: string
}

export function Sidebar({ className, chats, userId }: SidebarProps) {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  async function handleNewChat() {
    const result = await createChatAction({
      userId,
      name: "New Chat"
    })

    if (result.isSuccess && result.data) {
      router.push(`/ask/${result.data.id}`)
    }
  }

  async function handleDeleteChat(chatId: string) {
    const result = await deleteChatAction(chatId)

    if (result.isSuccess) {
      console.log("Chat deleted successfully")
    }
  }

  async function handleUrlUpload() {
    if (!url.trim()) return

    setIsProcessing(true)
    try {
      const markdownResult = await fetchMarkdownAction(url)
      if (markdownResult.isSuccess && markdownResult.data) {
        await processDocument(markdownResult.data, url)
        setUrl("")
      }
    } catch (error) {
      console.error("Error processing URL:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className={className}>
      <div className="flex gap-2 p-4">
        <Button onClick={handleNewChat} size="sm">
          <Plus className="mr-2 size-4" />
          New Chat
        </Button>

        <Sheet>
          <SheetTrigger asChild>
            <Button size="sm">Upload URL</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Upload Website Content</SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-4 py-4">
              <input
                type="url"
                placeholder="Enter website URL"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full rounded-md border p-2"
              />
              <Button
                onClick={handleUrlUpload}
                disabled={!url.trim() || isProcessing}
              >
                {isProcessing ? "Processing..." : "Upload"}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="p-4">
        {chats.map(chat => (
          <Link key={chat.id} href={`/ask/${chat.id}`} className="block">
            <div className="hover:bg-muted group flex items-center justify-between border-b p-2">
              {chat.name}
              <Trash
                className="size-4 cursor-pointer text-gray-500 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={e => {
                  e.preventDefault()
                  handleDeleteChat(chat.id)
                }}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
