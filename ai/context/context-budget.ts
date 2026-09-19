import { CHAT_CONTEXT_CONFIG } from "../config/context.config";
import { estimateMessagesTokens } from "../tokens/token-estimator";
import type { ContextMessage } from "./context.types";

type SplitMessagesResult = {
  messagesToSummarize: ContextMessage[];
  recentMessages: ContextMessage[];
};

export function needsMemoryUpdate(
  estimatedTokens: number,
): boolean {
  return (
    estimatedTokens >
    CHAT_CONTEXT_CONFIG.maxConversationTokens
  );
}

export function splitMessagesForMemory(
  messages: ContextMessage[],
): SplitMessagesResult {
  const recentMessages: ContextMessage[] = [];

  let recentTokens = 0;

  for (
    let index = messages.length - 1;
    index >= 0;
    index--
  ) {
    const message = messages[index];

    const messageTokens = estimateMessagesTokens([
      message,
    ]);

    if (
      recentMessages.length > 0 &&
      recentTokens + messageTokens >
        CHAT_CONTEXT_CONFIG.targetRecentTokens
    ) {
      break;
    }

    recentMessages.unshift(message);
    recentTokens += messageTokens;
  }

  const summarizeCount =
    messages.length - recentMessages.length;

  return {
    messagesToSummarize: messages.slice(
      0,
      summarizeCount,
    ),
    recentMessages,
  };
}