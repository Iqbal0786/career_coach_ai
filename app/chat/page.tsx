import { CareerCoachDashboard } from "@/components/CareerCoachDashboard";
import { getAuthenticatedUser } from "@/lib/supabase/auth/server";

type ChatPageProps = {
  searchParams: Promise<{
    prompt?: string;
  }>;
};

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const { prompt } = await searchParams;
  await getAuthenticatedUser();

  return <CareerCoachDashboard key="new-chat" initialPrompt={prompt} />;
}
