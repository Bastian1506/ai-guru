DO $$ BEGIN
 CREATE TYPE "public"."topic" AS ENUM('RAG', 'Agents', 'Strategy', 'evaluation', 'deployment');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DROP INDEX IF EXISTS "documents_embedding_index";--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "author" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "topic" TYPE topic USING topic::topic;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "topic" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "title" text NOT NULL;