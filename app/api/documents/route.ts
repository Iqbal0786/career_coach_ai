import { extractPdfText } from "@/lib/documents/extract-pdf-text";
import { ingestDocument } from "@/lib/services/document.service";
import { uploadDocument } from "@/lib/storage/supabase";
import { createChat } from "@/lib/db/repositories/chat.repository";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file");
    let chatId = formData.get("chatId")?.toString();

    if (!(file instanceof File)) {
      return Response.json(
        {
          success: false,
          error: "PDF file is required",
        },
        { status: 400 },
      );
    }

    if (file.type !== "application/pdf") {
      return Response.json(
        {
          success: false,
          error: "Only PDF files are supported",
        },
        { status: 400 },
      );
    }

    const storagePath = await uploadDocument(file);

    const text = await extractPdfText(file);
   
    if (!chatId) {
      const chat = await prisma.$transaction(async (tx) => {
        return createChat({}, tx);
      });
      chatId = chat.id;
    }

    const result = await ingestDocument({
      fileData: {
        name: file.name,
        storagePath,
        mimeType: file.type,
        size: file.size,
      },
      text,
      chatId,
    });

    return Response.json({
      success: true,
      chatId,
      ...result,
    });
  } catch (error) {
    console.error("Document ingestion failed:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to process document",
      },
      { status: 500 },
    );
  }
}