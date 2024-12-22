import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  vector,
  index,
  customType
} from "drizzle-orm/pg-core"

const tsvector = customType<{ data: string; notNull: true }>({
  dataType() {
    return "tsvector"
  }
})

export const topicEnum = pgEnum("topic", [
  "RAG",
  "Agents",
  "Strategy",
  "Evaluation",
  "Deployment",
  "Observability",
  "Other"
])

export const documentsTable = pgTable(
  "documents",
  {
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
      .$onUpdate(() => new Date()),
    search_vector: tsvector("search_vector").notNull()
  },
  table => ({
    embedding_index: index("documents_embedding_index").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
    search_vector_index: index("documents_search_index").using(
      "gin",
      table.search_vector
    )
  })
)

export type InsertDocument = typeof documentsTable.$inferInsert
export type SelectDocument = typeof documentsTable.$inferSelect
