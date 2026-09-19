import { saveAssistantMessage } from "@/lib/services/chat.service";

type HandleChatFinishInput = {
  chatId: string;
  text: string;
};

export async function handleChatFinish({
  chatId,
  text,
}: HandleChatFinishInput) {
  const content = text.trim();

  if (!content) {
    return;
  }

  try {
    await saveAssistantMessage({
      chatId,
      content,
    });
  } catch (error) {
    console.error("Failed to save assistant message:", error);
  }
}