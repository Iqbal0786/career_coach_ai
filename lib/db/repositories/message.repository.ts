import { prisma } from "@/lib/db/prisma";
import { DbClient } from "../types";

type MessageRole = "user" | "assistant";
type CreateMessageInput = {
  chatId: string;
  role: MessageRole;
  content: string;
};

export async function createMessage(data: CreateMessageInput, db:DbClient = prisma) {
  const message = await db.message.create({
    data,
  });

  await db.chat.update({
    where: {
      id: data.chatId,
    },
    data: {
      updatedAt: new Date(),
    },
  });

  return message;
}

export function findMessagesByChatId(chatId: string, db:DbClient = prisma) {
  return db.message.findMany({
    where: {
      chatId,
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      attachments: {
        include: {
          document: {
            select: {
              id: true,
              name: true,
              storagePath: true,
              mimeType: true,
            },
          },
        },
      },
    },
  });
}

export async function findMessagesAfterMemory(
  chatId: string,
  lastMemoryMessageId: string | null,
  db: DbClient = prisma,
) {
  if (!lastMemoryMessageId) {
    return db.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        attachments: {
          include: {
            document: {
              select: {
                id: true,
                name: true,
                storagePath: true,
                mimeType: true,
              },
            },
          },
        },
      },
    });
  }

  const boundaryMessage =
    await db.message.findUnique({
      where: {
        id: lastMemoryMessageId,
      },
      select: {
        createdAt: true,
      },
    });

  if (!boundaryMessage) {
    return [];
  }

  return db.message.findMany({
    where: {
      chatId,
      createdAt: {
        gt: boundaryMessage.createdAt,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      attachments: {
        include: {
          document: {
            select: {
              id: true,
              name: true,
              storagePath: true,
              mimeType: true,
            },
          },
        },
      },
    },
  });
}
