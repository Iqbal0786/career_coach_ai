import { ModelMessage } from "ai";

export type ContextMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type ChatContext = {
  memory: string | null;
  messages: ModelMessage[];
};