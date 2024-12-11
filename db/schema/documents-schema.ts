import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  vector
} from "drizzle-orm/pg-core"

export const topicEnum = pgEnum("topic", [
  "RAG",
  "Agents",
  "Strategy",
  "evaluation",
  "deployment"
])

export const documentsTable = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  author: text("author").notNull(),
  topic: topicEnum("topic").notNull(),
  url: text("url"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertDocument = typeof documentsTable.$inferInsert
export type SelectDocument = typeof documentsTable.$inferSelect
