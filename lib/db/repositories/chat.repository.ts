import { prisma } from "@/lib/db/prisma";
import { DbClient } from "../types";

type CreateChatInput = {
  title?: string;
  userId?: string;
};

export function createChat(data: CreateChatInput = {} , db:DbClient = prisma) {
  return db.chat.create({
    data,
  });
}

export function findChatById(chatId: string, db:DbClient = prisma) {
  return db.chat.findUnique({
    where: {
      id: chatId,
    },
     select: {
      id: true,
      memory: true,
      memoryVersion: true,
      lastMemoryMessageId: true,
      userId: true,
    },
  });
}

export function findRecentChats(
  {
    cursor,
    limit,
    userId,
  }: {
    cursor?: string;
    limit: number;
    userId: string;
  },
  db: DbClient = prisma,
) {
  return db.chat.findMany({
    where: { userId },
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    take: limit + 1,
    orderBy: [
      { isPinned: "desc" },
      { updatedAt: "desc" },
      { id: "desc" },
    ],
    select: {
      id: true,
      title: true,
      isPinned: true,
      updatedAt: true,
      messages: {
        where: {
          role: "user",
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 1,
        select: {
          content: true,
        },
      },
    },
  });
}

export async function setChatPinned(
  chatId: string,
  isPinned: boolean,
  userId: string,
  db: DbClient = prisma,
) {
  if (isPinned) {
    const pinnedCount = await db.chat.count({
      where: {
        isPinned: true,
        userId,
      },
    });

    if (pinnedCount >= 3) {
      throw new Error("You can pin up to 3 chats.");
    }
  }

  return db.chat.update({
    where: {
      id: chatId,
      userId,
    },
    data: {
      isPinned,
    },
    select: {
      id: true,
      isPinned: true,
    },
  });
}

export function deleteChat(chatId: string, userId: string, db: DbClient = prisma) {
  return db.chat.delete({
    where: {
      id: chatId,
      userId,
    },
    select: {
      id: true,
    },
  });
}

type UpdateChatMemoryInput = {
  chatId: string;
  memory: string;
  memoryVersion: number;
  lastMemoryMessageId: string;
};

export function updateChatMemory(
  {
    chatId,
    memory,
    memoryVersion,
    lastMemoryMessageId,
  }: UpdateChatMemoryInput,
  db: DbClient = prisma,
) {
  return db.chat.update({
    where: {
      id: chatId,
    },
    data: {
      memory,
      memoryVersion,
      lastMemoryMessageId,
    },
  });
}
