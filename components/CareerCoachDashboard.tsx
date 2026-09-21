"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { CareerCoachComposer } from "./chat/CareerCoachComposer";
import { CareerCoachSidebar } from "./chat/CareerCoachSidebar";
import { CareerCoachTranscript } from "./chat/CareerCoachTranscript";
import type { Attachment, Message, UploadStatus } from "./chat/types";

type CareerCoachDashboardProps = {
  chatId?: string;
  history?: Message[];
  initialPrompt?: string;
};

function getFriendlyChatError(error: unknown) {
  const rawMessage = error instanceof Error ? error.message : String(error);
  let message = rawMessage;

  try {
    const parsed = JSON.parse(rawMessage) as { error?: string; message?: string };
    message = parsed.error || parsed.message || message;
  } catch {
    // The response may be plain text instead of JSON.
  }

  if (/429|rate limit|too many requests|retry in/i.test(`${rawMessage} ${message}`)) {
    return "The AI service is temporarily busy. Please try again in a moment.";
  }

  if (/quota|resource exhausted|capacity/i.test(`${rawMessage} ${message}`)) {
    return "The AI service has temporarily reached its usage limit. Please try again later.";
  }

  return "The coach could not complete that response. Please try again.";
}

export function CareerCoachDashboard({ chatId, history, initialPrompt }: CareerCoachDashboardProps) {
  const [messages, setMessages] = useState<Message[]>(history ?? []);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [activeChatId, setActiveChatId] = useState(chatId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const nextMessageId = useRef(2);
  const initialPromptSent = useRef(false);
  const failedRequestRef = useRef<{ message: string; chatId?: string; documentId?: string } | null>(null);
  const routeId = chatId ?? "new-chat";
  const mountedRouteId = useRef(routeId);

  useEffect(() => {
    if (mountedRouteId.current === routeId) return;

    mountedRouteId.current = routeId;
    setMessages(history ?? []);
    setMessage("");
    setError("");
    setAttachment(null);
    setUploadStatus("idle");
    setIsSending(false);
    setActiveChatId(chatId);
    nextMessageId.current = 2;
    initialPromptSent.current = false;
  }, [chatId, history, routeId]);

  useEffect(() => {
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const canSubmit =
    (message.trim().length > 0 || attachment !== null) &&
    uploadStatus !== "uploading" &&
    uploadStatus !== "failed" &&
    !isSending;

  async function selectFile(file: File | undefined) {
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setAttachment(null);
      setUploadStatus("idle");
      setError("Please choose a PDF file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAttachment(null);
      setUploadStatus("idle");
      setError("PDF files must be 5 MB or smaller.");
      return;
    }

    setAttachment({ file, name: file.name, size: file.size });
    setUploadStatus("uploading");
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("chatId", activeChatId ?? "");

    try {
      const response = await fetch("/api/documents", { method: "POST", body: formData });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || "Failed to process PDF");
      }

      const result = await response.json();
      setAttachment((currentAttachment) => currentAttachment ? { ...currentAttachment, documentId: result.documentId, storagePath: result.storagePath, url: result.url } : currentAttachment);
      if (!activeChatId && result.chatId) {
        setActiveChatId(result.chatId);
        window.history.replaceState(null, "", `/chat/${result.chatId}`);
        window.dispatchEvent(new CustomEvent("career-chat-created", {
          detail: {
            id: result.chatId,
            title: file.name,
            isPinned: false,
            updatedAt: new Date().toISOString(),
          },
        }));
      }
      setUploadStatus("ready");
    } catch (caughtError) {
      console.error("Error uploading PDF:", caughtError);
      setUploadStatus("failed");
      setError(caughtError instanceof Error ? caughtError.message : "Failed to upload the PDF file.");
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    void selectFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: React.DragEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsDragging(false);
    void selectFile(event.dataTransfer.files[0]);
  }

  function retryUpload() {
    if (attachment) void selectFile(attachment.file);
  }

  const submitMessage = useCallback(async (nextMessage?: string, requestOverrides?: { chatId?: string; documentId?: string }) => {
    const requestedContent = (nextMessage ?? message).trim();
    const content = requestedContent || (attachment ? "Please review the attached file." : "");
    if (!content || isSending) return;

    const attachedFile = attachment;
    const requestChatId = requestOverrides?.chatId ?? activeChatId;
    const requestDocumentId = requestOverrides?.documentId ?? attachedFile?.documentId;
    const userMessage: Message = {
      id: nextMessageId.current,
      role: "user",
      content,
      attachments: attachedFile?.documentId ? [{ document: { id: attachedFile.documentId, name: attachedFile.name, storagePath: attachedFile.storagePath ?? "", mimeType: attachedFile.file.type, url: attachedFile.url } }] : undefined,
    };
    nextMessageId.current += 1;
    const coachMessageId = nextMessageId.current;
    nextMessageId.current += 1;

    setMessages((currentMessages) => [...currentMessages, userMessage, { id: coachMessageId, role: "assistant", content: "" }]);
    setMessage("");
    setAttachment(null);
    setUploadStatus("idle");
    setError("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          ...(requestChatId && { chatId: requestChatId }),
          ...(requestDocumentId && { documentId: requestDocumentId }),
        }),
      });

      if (!response.ok || !response.body) throw new Error((await response.text()) || "Request failed");

      const responseChatId = response.headers.get("X-Chat-Id");
      if (!activeChatId && responseChatId) {
        setActiveChatId(responseChatId);
        window.history.replaceState(null, "", `/chat/${responseChatId}`);
        window.dispatchEvent(new CustomEvent("career-chat-created", {
          detail: {
            id: responseChatId,
            title: content,
            isPinned: false,
            updatedAt: new Date().toISOString(),
          },
        }));
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((currentMessages) => currentMessages.map((chatMessage) => chatMessage.id === coachMessageId ? { ...chatMessage, content: chatMessage.content + chunk } : chatMessage));
      }

      failedRequestRef.current = null;

    } catch (caughtError) {
      const friendlyError = getFriendlyChatError(caughtError);
      failedRequestRef.current = { message: content, chatId: requestChatId, documentId: requestDocumentId };
      setMessages((currentMessages) => currentMessages.map((chatMessage) => chatMessage.id === coachMessageId ? { ...chatMessage, content: friendlyError } : chatMessage));
      setError(friendlyError);
    } finally {
      setIsSending(false);
    }
  }, [activeChatId, attachment, isSending, message]);

  function retryMessage() {
    const failedRequest = failedRequestRef.current;
    if (!failedRequest || isSending) return;
    setMessages((currentMessages) => currentMessages.slice(0, -2));
    setError("");
    void submitMessage(failedRequest.message, failedRequest);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitMessage();
  }

  useEffect(() => {
    if (initialPrompt && !initialPromptSent.current && messages.length === 0) {
      initialPromptSent.current = true;
      void submitMessage(initialPrompt);
    }
  }, [initialPrompt, messages.length, submitMessage]);

  return (
    <main className="flex h-screen min-h-0 overflow-hidden bg-[#fbfaf6] text-stone-950">
      <CareerCoachSidebar activeChatId={activeChatId} />
      <section className="flex min-h-0 min-w-0 flex-1 flex-col lg:ml-64">
        <div className="flex min-h-0 flex-1 flex-col border-l-2 border-[#d8e1dc]">
          <CareerCoachTranscript messages={messages} isSending={isSending} transcriptRef={transcriptRef} onStarterPrompt={(prompt) => void submitMessage(prompt)} />
          <CareerCoachComposer
            message={message}
            attachment={attachment}
            uploadStatus={uploadStatus}
            isDragging={isDragging}
            isSending={isSending}
            canSubmit={canSubmit}
            error={error}
            fileInputRef={fileInputRef}
            onSubmit={handleSubmit}
            onMessageChange={(event) => setMessage(event.target.value)}
            onFileChange={handleFileChange}
            onDrop={handleDrop}
            onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onOpenFilePicker={() => fileInputRef.current?.click()}
            onRemoveAttachment={() => { setAttachment(null); setUploadStatus("idle"); setError(""); }}
            onRetryUpload={retryUpload}
            onRetryMessage={retryMessage}
            onSend={() => void submitMessage()}
          />
        </div>
      </section>
    </main>
  );
}
