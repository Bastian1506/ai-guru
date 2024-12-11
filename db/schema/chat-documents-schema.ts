import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core"
import { chatsTable } from "./chats-schema"
import { documentsTable } from "./documents-schema"
import { relations } from "drizzle-orm"

export const chatDocumentsTable = pgTable(
  "chat_documents",
  {
    chatId: uuid("chat_id")
      .references(() => chatsTable.id, { onDelete: "cascade" })
      .notNull(),
    documentId: uuid("document_id")
      .references(() => documentsTable.id, { onDelete: "cascade" })
      .notNull()
  },
  table => ({
    pk: primaryKey({ columns: [table.chatId, table.documentId] })
  })
)

export const chatDocumentsRelations = relations(
  chatDocumentsTable,
  ({ one }) => ({
    document: one(documentsTable, {
      fields: [chatDocumentsTable.documentId],
      references: [documentsTable.id]
    })
  })
)

export type InsertChatDocument = typeof chatDocumentsTable.$inferInsert
export type SelectChatDocument = typeof chatDocumentsTable.$inferSelect
