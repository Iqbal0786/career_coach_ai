import { prisma } from "@/lib/db/prisma";

import {
  createChat,
  findChatById,
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
