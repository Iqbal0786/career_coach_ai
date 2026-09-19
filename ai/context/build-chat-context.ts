import {
  getChatById,
  getMessagesAfterMemory,
} from "@/lib/services/chat.service";

import { manageConversationMemory } from "@/lib/services/memory.service";

import type {
  ChatContext,
  ContextMessage,
} from "./context.types";

export async function buildChatContext(
  chatId: string,
): Promise<ChatContext> {
  const chat = await getChatById(chatId);

  if (!chat) {
    return {
      memory: null,
      messages: [],
    };
  }

  const conversation = await getMessagesAfterMemory(
    chatId,
    chat.lastMemoryMessageId,
  );

  // No new messages after the memory boundary
  if (!conversation.length) {
    return {
      memory: chat.memory,
      messages: [],
    };
  }

  const messages: ContextMessage[] =
    conversation.map((message) => ({
      id: message.id,
      role: message.role as any,
      content: message.content,
    }));

  const {
    memory,
    recentMessages,
  } = await manageConversationMemory({
    chatId,
    messages,
    existingMemory: chat.memory,
  });

  return {
    memory,
    messages: recentMessages.map(
      ({ role, content }) => ({
        role,
        content,
      }),
    ),
  };
}