"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function SidebarSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="space-y-2 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}
