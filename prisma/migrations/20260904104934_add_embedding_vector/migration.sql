-- This is an empty migration.
ALTER TABLE "DocumentChunk"
ADD COLUMN "embedding" vector(3072);