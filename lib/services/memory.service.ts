import { MEMORY_CONFIG } from "@/ai/config/memory.config";
import {
  needsMemoryUpdate,
  splitMessagesForMemory,
} from "@/ai/context/context-budget";
import { updateConversationMemory } from "@/ai/context/update-conversation-memory";
import { estimateMessagesTokens } from "@/ai/tokens/token-estimator";

import { updateChatMemory } from "../db/repositories/chat.repository";

import type { ContextMessage } from "@/ai/context/context.types";

type PersistConversationMemoryInput = {
  chatId: string;
  memory: string;
  lastMemoryMessageId: string;
};

export async function persistConversationMemory({
  chatId,
  memory,
  lastMemoryMessageId,
}: PersistConversationMemoryInput) {
  return updateChatMemory({
    chatId,
    memory,
    memoryVersion: MEMORY_CONFIG.version,
    lastMemoryMessageId,
  });
}

type ManageConversationMemoryInput = {
  chatId: string;
  messages: ContextMessage[];
  existingMemory: string | null;
};

type ManageConversationMemoryResult = {
  memory: string | null;
  recentMessages: ContextMessage[];
};

export async function manageConversationMemory({
  chatId,
  messages,
  existingMemory,
}: ManageConversationMemoryInput): Promise<ManageConversationMemoryResult> {
  if (!messages.length) {
    return {
      memory: existingMemory,
      recentMessages: [],
    };
  }

  const estimatedTokens =
    estimateMessagesTokens(messages);

  const shouldUpdateMemory =
    needsMemoryUpdate(estimatedTokens);

  if (!shouldUpdateMemory) {
    return {
      memory: existingMemory,
      recentMessages: messages,
    };
  }

  const {
    messagesToSummarize,
    recentMessages,
  } = splitMessagesForMemory(messages);

  const lastMessageToSummarize =
    messagesToSummarize.at(-1);

  if (!lastMessageToSummarize) {
    return {
      memory: existingMemory,
      recentMessages,
    };
  }

  const memory = await updateConversationMemory({
    messages: messagesToSummarize,
    existingMemory,
  });

  console.log("Conversation memory generated:", {
    chatId,
    memory,
  });

  await persistConversationMemory({
    chatId,
    memory,
    lastMemoryMessageId:
      lastMessageToSummarize.id,
  });

  return {
    memory,
    recentMessages,
  };
}