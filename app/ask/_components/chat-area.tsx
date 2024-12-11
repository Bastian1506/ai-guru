"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { SelectDocument, SelectMessage } from "@/db/schema"
import { runRagPipeline } from "@/actions/rag/retrieval/run-rag-pipeline"
import { generateCompletionWithContext } from "@/actions/rag/generation/generate-completion"
import { readStreamableValue } from "ai/rsc"
import { createMessageAction } from "@/actions/db/messages-actions"
import { createChatAction } from "@/actions/db/chats-actions"
import { useRouter } from "next/navigation"
import { updateMessageAction } from "@/actions/db/messages-actions"
import ReactMarkdown from "react-markdown"
import { addDocumentToChatAction } from "@/actions/db/chat-documents-actions"
import { updateChatAction } from "@/actions/db/chats-actions"
import { generateChatName } from "@/lib/chat-utils"
import { getOptimizedQuery } from "@/actions/rag/retrieval/optimize-query"

interface ChatAreaProps {
  initialDocuments: SelectDocument[]
  initialMessages: SelectMessage[]
  userId: string
  chatId: string
}

export function ChatArea({
  initialDocuments,
  initialMessages,
  userId,
  chatId
}: ChatAreaProps) {
  console.log("Initial documents:", initialDocuments)
  const [query, setQuery] = useState("")
  const [messages, setMessages] = useState<SelectMessage[]>(initialMessages)
  const [documents, setDocuments] = useState<SelectDocument[]>(initialDocuments)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRetrieving, setIsRetrieving] = useState(false)

  const router = useRouter()

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleGenerate = async (query: string) => {
    setIsRetrieving(true)

    let currentChatId = chatId
    if (!currentChatId) {
      const chatName = await generateChatName(query)
      const newChat = await createChatAction({
        userId,
        name: chatName
      })
      if (!newChat.isSuccess || !newChat.data) {
        console.error("Failed to create chat")
        return
      }
      currentChatId = newChat.data.id
      router.push(`/ask/${currentChatId}`)
    } else if (messages.length === 0) {
      const chatName = await generateChatName(query)
      await updateChatAction(currentChatId, { name: chatName })
    }

    const userMessage = await createMessageAction({
      chatId: currentChatId,
      content: query,
      role: "user"
    })

    if (!userMessage.isSuccess || !userMessage.data) {
      console.error("Failed to save user message")
      return
    }

    setMessages(prev => [...prev, userMessage.data!])

    const assistantMessage = await createMessageAction({
      chatId: currentChatId,
      content: "Generating response...",
      role: "assistant"
    })

    if (!assistantMessage.isSuccess || !assistantMessage.data) {
      console.error("Failed to save assistant message")
      return
    }

    setMessages(prev => [...prev, assistantMessage.data!])

    let relevantDocs = documents

    const optimizedQuery = await getOptimizedQuery(query, messages)

    const docsResponse = await runRagPipeline(optimizedQuery)
    if (!docsResponse.isSuccess || !docsResponse.data?.results.length) {
      await updateMessageAction(
        assistantMessage.data.id,
        "I couldn't find any relevant information to answer your question. Please try rephrasing or asking something else."
      )

      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessage.data!.id
            ? {
                ...msg,
                content:
                  "I couldn't find any relevant information to answer your question. Please try rephrasing or asking something else."
              }
            : msg
        )
      )
      setIsRetrieving(false)
      return
    }

    const newDocs = docsResponse.data.results as any
    const mergedDocs = [...relevantDocs]

    for (const newDoc of newDocs) {
      const exists = mergedDocs.some(doc => doc.id === newDoc.id)
      if (!exists) {
        mergedDocs.push(newDoc)
        await addDocumentToChatAction({
          chatId: currentChatId,
          documentId: newDoc.id
        })
      }
    }

    relevantDocs = mergedDocs
    setDocuments(mergedDocs)

    const context = relevantDocs.map(doc => doc.content).join("\n\n")
    setIsRetrieving(false)
    setIsGenerating(true)

    const response = await generateCompletionWithContext(
      context,
      query,
      messages
    )
    if (!response.isSuccess || !response.data) {
      console.error("Error generating completion:", response.message)
      setIsGenerating(false)
      return
    }
    setIsGenerating(false)

    let fullResponse = ""
    try {
      for await (const chunk of readStreamableValue(response.data)) {
        if (chunk) {
          fullResponse += chunk
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessage.data!.id
                ? { ...msg, content: fullResponse }
                : msg
            )
          )
        }
      }
      await updateMessageAction(assistantMessage.data.id, fullResponse)
    } catch (error) {
      console.error("Error reading streamable value:", error)
    }
  }

  const handleSearch = async () => {
    if (!query.trim() || isGenerating || isRetrieving) return
    await handleGenerate(query)
    setQuery("") // Clear input after sending
  }

  return (
    <div className="flex h-full flex-col">
      {messages.length > 0 ? (
        // Messages view when there are messages
        <>
          {/* Scrollable messages container */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Documents section - always at top */}
            {documents.length > 0 && (
              <div className="mb-6">
                <h3 className="text-muted-foreground mb-2 text-sm font-medium">
                  Sources:
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {documents
                    .reduce((unique, doc) => {
                      const document = (
                        "document" in doc ? doc.document : doc
                      ) as SelectDocument
                      const key = `${document.author}-${document.title}`
                      return unique.some(d => `${d.author}-${d.title}` === key)
                        ? unique
                        : [...unique, document]
                    }, [] as SelectDocument[])
                    .map(document => (
                      <a
                        key={document.id}
                        href={document.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-secondary/50 hover:bg-secondary max-w-[300px] shrink-0 cursor-pointer rounded-lg p-3 transition-colors"
                      >
                        <div className="line-clamp-1 font-medium">
                          {document.title || "Untitled"}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          by {document.author}
                        </div>
                      </a>
                    ))}
                </div>
              </div>
            )}

            {/* Messages section */}
            <div className="space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[80%] rounded-lg p-4",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted mr-auto"
                  )}
                >
                  {message.role === "assistant" ? (
                    <ReactMarkdown className="prose dark:prose-invert">
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    message.content
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input fixed at bottom */}
          <div className="border-t p-4">
            <div className="space-y-2">
              <div className="font-bold text-white">Ask anything</div>
              <div className="relative">
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="What would you like to know?"
                  className="pr-10"
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      if (!query.trim() || isGenerating || isRetrieving) return
                      handleGenerate(query)
                      setQuery("")
                    }
                  }}
                />
                <Search
                  className={cn(
                    "absolute right-3 top-1/2 size-5 -translate-y-1/2",
                    isGenerating || isRetrieving
                      ? "text-muted-foreground animate-pulse"
                      : "text-muted-foreground hover:text-foreground cursor-pointer"
                  )}
                  onClick={handleSearch}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        // Centered input when no messages
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-xl space-y-2">
            <div className="text-center font-bold text-white">Ask anything</div>
            <div className="relative">
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="What would you like to know?"
                className="pr-10"
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    if (!query.trim() || isGenerating || isRetrieving) return
                    handleGenerate(query)
                    setQuery("")
                  }
                }}
              />
              <Search
                className={cn(
                  "absolute right-3 top-1/2 size-5 -translate-y-1/2",
                  isGenerating || isRetrieving
                    ? "text-muted-foreground animate-pulse"
                    : "text-muted-foreground hover:text-foreground cursor-pointer"
                )}
                onClick={handleSearch}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
