import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/db/prisma";

import { DbClient } from "../types";

type CreateDocumentInput = {
    name: string;
    storagePath: string;
    mimeType: string;
    size: number;
};


export function createDocument(
  data: CreateDocumentInput,
  db: DbClient = prisma,
) {
  return db.document.create({
    data,
  });
}

type CreateDocumentChunksInput = {
  documentId: string;
  chunks: Array<{
    id: string;
    content: string;
    embedding: number[];
  }>;
};

export async function createDocumentChunks(
  {
    documentId,
    chunks,
  }: CreateDocumentChunksInput,
  db: DbClient = prisma,
) {
  if (!chunks.length) {
    return;
  }

  const values = chunks.map(
    ({ id, content, embedding }) =>
      Prisma.sql`(
        ${id},
        ${documentId},
        ${content},
        ${JSON.stringify(embedding)}::vector
      )`,
  );

  await db.$executeRaw(
    Prisma.sql`
      INSERT INTO "DocumentChunk"
        ("id", "documentId", "content", "embedding")
      VALUES ${Prisma.join(values)}
    `,
  );
}


type SimilarChunk = {
  id: string;
  content: string;
  distance: number;
  documentId: string;
};

export async function findSimilarDocumentChunks(
  {
    documentId,
    embedding,
    limit = 5,
  }: {
    documentId: string;
    embedding: number[];
    limit?: number;
  },
  db: DbClient = prisma,
): Promise<SimilarChunk[]> {
  const vector = `[${embedding.join(",")}]`;

  return db.$queryRaw<SimilarChunk[]>(
    Prisma.sql`
      SELECT
        "id",
        "content",
        "documentId",
        "embedding" <=> ${vector}::vector AS "distance"
      FROM "DocumentChunk"
      WHERE "documentId" = ${documentId}
      ORDER BY "embedding" <=> ${vector}::vector
      LIMIT ${limit}
    `,
  );
}

export function findDocumentChunks(
  documentId: string,
  limit = 20,
  db: DbClient = prisma,
) {
  return db.documentChunk.findMany({
    where: { documentId },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: {
      id: true,
      content: true,
      documentId: true,
    },
  });
}

export async function findSimilarChunksInChat(
  {
    chatId,
    embedding,
    limit = 10,
  }: {
    chatId: string;
    embedding: number[];
    limit?: number;
  },
  db: DbClient = prisma,
): Promise<SimilarChunk[]> {
  const vector = `[${embedding.join(",")}]`;

  return db.$queryRaw<SimilarChunk[]>(
    Prisma.sql`
      SELECT
        dc."id",
        dc."content",
        dc."documentId",
        dc."embedding" <=> ${vector}::vector AS "distance"
      FROM "DocumentChunk" dc
      INNER JOIN "ChatDocument" cd ON dc."documentId" = cd."documentId"
      WHERE cd."chatId" = ${chatId}
      ORDER BY dc."embedding" <=> ${vector}::vector
      LIMIT ${limit}
    `,
  );
}

export async function findDocumentsByChatId(
  chatId: string,
  db: DbClient = prisma,
) {
  return db.chatDocument.findMany({
    where: { chatId },
    include: {
      document: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export function attachDocumentToChat(
  {
    chatId,
    documentId,
  }: {
    chatId: string;
    documentId: string;
  },
  db: DbClient = prisma,
) {
  return db.chatDocument.create({
    data: {
      chatId,
      documentId,
    },
  });
}

export function createAttachment(
  {
    messageId,
    documentId,
  }: {
    messageId: string;
    documentId: string;
  },
  db: DbClient = prisma,
) {
  return db.attachment.create({
    data: {
      messageId,
      documentId,
    },
  });
}