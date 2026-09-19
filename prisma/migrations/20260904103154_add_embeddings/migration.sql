-- This is an empty migration.
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "DocumentChunk"
ADD COLUMN "embedding" vector(3072);