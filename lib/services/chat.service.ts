import { prisma } from "@/lib/db/prisma";

import {
  createChat,
  deleteChat,
  findChatById,
  findRecentChats,
  setChatPinned,
} from "@/lib/db/repositories/chat.repository";

import {
  createMessage,
  findMessagesAfterMemory,
  findMessagesByChatId,
} from "@/lib/db/repositories/message.repository";
import { createAttachment } from "@/lib/db/repositories/document.repository";

type ProcessUserMessageInput = {
  chatId?: string;
  content: string;
  documentId?: string;
};

type SaveAssistantMessageInput = {
  chatId: string;
  content: string;
};


export async function processUserMessage({
  chatId,
  content,
  documentId,
}: ProcessUserMessageInput) {
  if (chatId) {
    const chat = await findChatById(chatId);

    if (!chat) {
      throw new Error("Chat not found");
    }

    await prisma.$transaction(async (tx) => {
      const message = await createMessage(
        {
          chatId: chat.id,
          role: "user",
          content,
        },
        tx,
      );

      if (documentId) {
        await createAttachment(
          {
            messageId: message.id,
            documentId,
          },
          tx,
        );
      }
    });

    return chat;
  }

  return prisma.$transaction(async (tx) => {
    const chat = await createChat({}, tx);

    const message = await createMessage(
      {
        chatId: chat.id,
        role: "user",
        content,
      },
      tx,
    );

    if (documentId) {
      await createAttachment(
        {
          messageId: message.id,
          documentId,
        },
        tx,
      );
    }

    return chat;
  });
}


export async function saveAssistantMessage({
  chatId,
  content,
}: SaveAssistantMessageInput) {
  return createMessage({
    chatId,
    role: "assistant",
    content,
  });
}

export async function getChatHistory(chatId: string) {
   return findMessagesByChatId(chatId);
}

export async function getRecentChats(cursor?: string, limit = 20) {
  const chats = await findRecentChats({ cursor, limit });
  const hasMore = chats.length > limit;
  const items = hasMore ? chats.slice(0, limit) : chats;

  return {
    chats: items.map((chat) => ({
      id: chat.id,
      title: chat.title || chat.messages[0]?.content || "New conversation",
      isPinned: chat.isPinned,
      updatedAt: chat.updatedAt,
    })),
    nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
  };
}

export async function pinChat(chatId: string, isPinned: boolean) {
  return prisma.$transaction((tx) => setChatPinned(chatId, isPinned, tx));
}

export async function removeChat(chatId: string) {
  return deleteChat(chatId);
}

export async function getChatById(chatId: string) {
  return findChatById(chatId);
}

export async function getMessagesAfterMemory(
  chatId: string,
  lastMemoryMessageId: string | null,
) {
  return findMessagesAfterMemory(
    chatId,
    lastMemoryMessageId,
  );
}
