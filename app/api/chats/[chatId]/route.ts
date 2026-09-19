import { pinChat, removeChat } from "@/lib/services/chat.service";

type ChatRouteContext = {
  params: Promise<{
    chatId: string;
  }>;
};

export async function PATCH(req: Request, { params }: ChatRouteContext) {
  try {
    const { chatId } = await params;
    const body = await req.json();

    if (typeof body?.isPinned !== "boolean") {
      return Response.json(
        { success: false, error: "isPinned must be a boolean" },
        { status: 400 },
      );
    }

    const chat = await pinChat(chatId, body.isPinned);
    return Response.json({ success: true, chat });
  } catch (error) {
    if (error instanceof Error && error.message === "You can pin up to 3 chats.") {
      return Response.json(
        { success: false, error: error.message },
        { status: 409 },
      );
    }

    console.error("Failed to update chat pin:", error);
    return Response.json(
      { success: false, error: "Failed to update chat" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, { params }: ChatRouteContext) {
  try {
    const { chatId } = await params;
    await removeChat(chatId);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete chat:", error);
    return Response.json(
      { success: false, error: "Failed to delete chat" },
      { status: 500 },
    );
  }
}
