import type { ModelMessage } from "ai";

const CHARS_PER_TOKEN = 4;
const MESSAGE_OVERHEAD_TOKENS = 4;

export function estimateTokens(text: string): number {
  if (!text.trim()) {
    return 0;
  }

  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

export function estimateMessagesTokens(
  messages: any[],
): number {
  return messages.reduce((total, message) => {
    if (typeof message.content !== "string") {
      return total;
    }

    return (
      total +
      estimateTokens(message.content) +
      MESSAGE_OVERHEAD_TOKENS
    );
  }, 0);
}