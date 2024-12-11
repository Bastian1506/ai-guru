"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function ChatSkeleton() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-4">
        <Skeleton className="mx-auto h-8 w-48" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}
