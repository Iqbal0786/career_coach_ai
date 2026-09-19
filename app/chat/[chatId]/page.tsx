// app/chat/[chatId]/page.tsx

import { CareerCoachDashboard } from "@/components/CareerCoachDashboard";
import { getChatHistory } from "@/lib/services/chat.service";

type ChatPageProps = {
  params: Promise<{
    chatId: string;
  }>;
};

export default async function ChatPage({
  params,
}: ChatPageProps) {
  const { chatId } = await params;
  const chatHistory= await getChatHistory(chatId);

  return <CareerCoachDashboard chatId={chatId} history={chatHistory as any}     />;
}