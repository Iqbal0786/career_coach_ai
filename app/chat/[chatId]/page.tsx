// app/chat/[chatId]/page.tsx

import { CareerCoachDashboard } from "@/components/CareerCoachDashboard";
import { getChatHistory } from "@/lib/services/chat.service";
import { getAuthenticatedUser } from "@/lib/supabase/auth/server";
import { redirect } from "next/navigation";
import type { Message } from "@/components/chat/types";

type ChatPageProps = {
  params: Promise<{
    chatId: string;
  }>;
};

export default async function ChatPage({
  params,
}: ChatPageProps) {
  const { chatId } = await params;
  const { appUser } = await getAuthenticatedUser();
  let chatHistory;

  try {
    chatHistory = await getChatHistory(chatId, appUser.id);
  } catch {
    redirect("/chat");
  }

  return <CareerCoachDashboard key={chatId} chatId={chatId} history={chatHistory as Message[]} />;
}