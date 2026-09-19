const isDevelopment = process.env.NODE_ENV === "development";

export const CHAT_CONTEXT_CONFIG = {
  maxConversationTokens: isDevelopment ? 500 : 6000,

  targetRecentTokens: isDevelopment ? 200 : 2500,

  maxSummaryTokens: isDevelopment ? 150 : 1500,

  reservedOutputTokens: 3000,
} as const;


