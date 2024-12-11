import {
  chatsTable,
  messagesTable,
  documentsTable,
  chatDocumentsTable,
  chatDocumentsRelations,
  profilesTable
} from "@/db/schema"
import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

config({ path: ".env.local" })

const schema = {
  chats: chatsTable,
  messages: messagesTable,
  documents: documentsTable,
  chatDocuments: chatDocumentsTable,
  profiles: profilesTable,
  chatDocumentsRelations
}

const client = postgres(process.env.DATABASE_URL!)

export const db = drizzle(client, { schema })
