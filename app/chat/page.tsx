import { CareerCoachDashboard } from "@/components/CareerCoachDashboard";

type ChatPageProps = {
  searchParams: Promise<{
    prompt?: string;
  }>;
};

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const { prompt } = await searchParams;

  return <CareerCoachDashboard initialPrompt={prompt} />;
}
