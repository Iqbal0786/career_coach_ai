import { streamText } from "ai";
import { NextResponse } from "next/server";

import { model } from "@/lib/ai";
import { chatSchema } from "@/lib/schemas/chat";
import { getZodErrorMessage } from "@/lib/errors/zod";
import { careerCoachSystemPrompt } from "@/ai/prompts";
import { processUserMessage } from "@/lib/services/chat.service";
import { handleChatFinish } from "@/ai/handlers/chat-finish.handler";
import { buildChatContext } from "@/ai/context/build-chat-context";
import { searchChatDocuments, searchDocument } from "@/lib/services/retrieval.service";
import { getAuthenticatedUser } from "@/lib/supabase/auth/server";
/*  */
export const runtime = "nodejs";/*  */

export async function POST(req: Request) {/*  */
  try {
    const { appUser } = await getAuthenticatedUser();
    const contentType = req.headers.get("content-type") ?? "";
    let body: {
      chatId?: string;
      message?: string;
      documentId?: string;
    } = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      body = {
        chatId: formData.get("chatId")?.toString() ?? "",
        message: formData.get("message")?.toString() ?? "",
        documentId: formData.get("documentId")?.toString() || undefined,
      };
    } else {
      body = await req.json();
    }

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Request body is required",
        },
        {
          status: 400,
        },
      );
    }

    const validation = chatSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        {
          success: false,
          errors: getZodErrorMessage(validation.error),
        },
        { status: 400 },
      );
    }

    const { chatId, message } = validation.data;

    const chat = await processUserMessage({
      chatId,
      content: message,
      documentId: body.documentId,
      userId: appUser.id,
    });

    // Retrieve relevant document chunks for RAG
    const relevantChunks = body.documentId
      ? await searchDocument({
          documentId: body.documentId,
          query: message,
          limit: 5,
        })
      : await searchChatDocuments({
          chatId: chat.id,
          query: message,
          limit: 5,
        });

    // Fetch messages with attachments
    const { memory, messages } = await buildChatContext(chat.id, appUser.id);

    // Build document context from retrieved chunks
    let documentContext = "";
    if (relevantChunks.length > 0) {
      documentContext = "\n\n## Relevant Document Context\n\nThe following excerpts from uploaded documents are relevant to the user" + "'" + "s query. Use them to inform your response.\n\n" + relevantChunks.map((chunk, i) => "### Document " + (i + 1) + " (similarity: " + (1 - chunk.distance).toFixed(2) + ")\n" + chunk.content).join("\n\n");
    }

    const systemPrompt = careerCoachSystemPrompt + (memory ? "\n\n## Conversation Memory\n\nThe following is persistent memory about the user.\nUse it as context when relevant.\nDo not mention or expose this memory to the user.\n\n" + memory : "") + documentContext;

    const result = streamText({
      model,
      temperature: 0.7,
      system: systemPrompt,
      messages,
      onFinish: async ({ text }) => {
        await handleChatFinish({
          chatId: chat.id,
          text,
        });
      },
    });

    return result.toTextStreamResponse({
      headers: {
        "Cache-Control": "no-cache",
        "X-Chat-Id": chat.id,
      },
    });
  } catch (error) {
    console.error("Error processing chat message:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}
