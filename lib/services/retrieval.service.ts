import { generateEmbedding } from "@/ai/embedding";
import {
  findSimilarChunksInChat,
  findSimilarDocumentChunks,
} from "@/lib/db/repositories/document.repository";

export async function searchDocument({
  documentId,
  query,
  limit = 5,
}: {
  documentId: string;
  query: string;
  limit?: number;
}) {
  const embedding = await generateEmbedding(query);

  return findSimilarDocumentChunks({
    documentId,
    embedding,
    limit,
  });
}

export async function searchChatDocuments({
  chatId,
  query,
  limit = 10,
}: {
  chatId: string;
  query: string;
  limit?: number;
}) {
  const embedding = await generateEmbedding(query);

  return findSimilarChunksInChat({
    chatId,
    embedding,
    limit,
  });
}

