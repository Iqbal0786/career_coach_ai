import { NextResponse } from "next/server";
import { getDocumentsByChatId } from "@/lib/services/document.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json(
        {
          success: false,
          error: "chatId is required",
        },
        { status: 400 },
      );
    }

    const documents = await getDocumentsByChatId(chatId);

    return NextResponse.json({
      success: true,
      documents: documents.map((cd) => ({
        id: cd.document.id,
        name: cd.document.name,
        mimeType: cd.document.mimeType,
        size: cd.document.size,
        createdAt: cd.document.createdAt,
        uploadedAt: cd.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching documents:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch documents",
      },
      { status: 500 },
    );
  }
}
