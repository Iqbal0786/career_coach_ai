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
