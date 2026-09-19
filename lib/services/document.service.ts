import {
  attachDocumentToChat,
  createDocument,
  createDocumentChunks,
  findDocumentsByChatId,
} from "@/lib/db/repositories/document.repository";

import { prisma } from "@/lib/db/prisma";
import { generateEmbeddings } from "@/ai/embedding";
import { chunkText } from "@/lib/documents/chunk-text";

export async function ingestDocument({
  fileData,
  text,
  chatId
}: {
  fileData: {
    name: string;
    storagePath: string;
    mimeType: string;
    size: number;
  };
  text: string;
  chatId: string;
}) {
  const chunks = chunkText(text);

  if (!chunks.length) {
    throw new Error("No text found in document");
  }

  const embeddings = await generateEmbeddings(chunks);

  if (embeddings.length !== chunks.length) {
    throw new Error(
      "Embedding count does not match chunk count",
    );
  }

  return prisma.$transaction(async (tx) => {
    const document = await createDocument(
      fileData,
      tx,
    );
    await attachDocumentToChat(
      {
        chatId,
        documentId: document.id,
      },
      tx,
    );
   
    const chunkRecords = chunks.map(
      (content, index) => ({
        id: crypto.randomUUID(),
        content,
        embedding: embeddings[index],
      }),
    );

    await createDocumentChunks(
      {
        documentId: document.id,
        chunks: chunkRecords,
      },
      tx,
    );

    return {
      documentId: document.id,
      chunkCount: chunkRecords.length,
    };
  });
}

export async function getDocumentsByChatId(chatId: string) {
  return findDocumentsByChatId(chatId);
}
