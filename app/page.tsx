"use server"

import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut } from "@clerk/nextjs"
import Link from "next/link"

export default async function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-4 p-24">
      <SignedIn>
        <div>Welcome to ai-guru</div>
        <Link href="/ask">
          <Button>Start Asking &rarr;</Button>
        </Link>
      </SignedIn>

      <SignedOut>
        <div>Please login to access the ask page</div>
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      </SignedOut>
    </main>
  )
}
