-- Add search_vector column as GENERATED COLUMN
ALTER TABLE "documents" ADD COLUMN "search_vector" tsvector
GENERATED ALWAYS AS (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,''))) STORED;

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS "documents_search_index" ON "documents" 
USING gin ("search_vector");

-- Create HNSW index for vector similarity
CREATE INDEX IF NOT EXISTS "documents_embedding_index" ON "documents" 
USING hnsw ("embedding" vector_cosine_ops)
