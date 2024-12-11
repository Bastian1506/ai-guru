ALTER TABLE "documents" ADD COLUMN "topic" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "documents_embedding_index" ON "documents" USING hnsw ("embedding" vector_cosine_ops);