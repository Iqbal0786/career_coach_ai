import { getRecentChats } from "@/lib/services/chat.service";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const requestedLimit = Number(url.searchParams.get("limit"));
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), MAX_LIMIT)
      : DEFAULT_LIMIT;
    const cursor = url.searchParams.get("cursor") || undefined;

    return Response.json(await getRecentChats(cursor, limit));
  } catch (error) {
    console.error("Failed to load recent chats:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to load recent chats",
      },
      { status: 500 },
    );
  }
}
