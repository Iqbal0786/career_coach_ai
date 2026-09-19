"use client";

import Link from "next/link";
import {
  Fragment,
  FormEvent,
  ReactNode,
  useRef,
  useState,
} from "react";

type Message = {
  id: number | string;
  role: "user" | "assistant";
  content: string;
  attachments?: {
    document: {
      id: string;
      name: string;
      storagePath: string;
      mimeType: string;
    };
  }[];
};

type Attachment = {
  file: File;
  name: string;
  size: number;
  documentId?: string;
};

type UploadStatus = "idle" | "uploading" | "ready" | "failed";

const starterPrompts = [
  "Improve my resume for a product manager role.",
  "Make me a 30-day interview prep plan.",
  "Help me choose between two career paths.",
];


function renderInlineMarkdown(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];

    if (token.startsWith("**")) {
      parts.push(
        <strong key={`${token}-${match.index}`} className="font-semibold">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);

      if (linkMatch) {
        parts.push(
          <a
            key={`${token}-${match.index}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-teal-700 underline underline-offset-2"
          >
            {linkMatch[1]}
          </a>,
        );
      }
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function MarkdownMessage({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/);

  return (
    <div className="space-y-3">
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n");
        const trimmedBlock = block.trim();

        if (!trimmedBlock) {
          return null;
        }

        if (trimmedBlock.startsWith("```")) {
          const code = trimmedBlock
            .replace(/^```[a-zA-Z0-9_-]*\n?/, "")
            .replace(/```$/, "");

          return (
            <pre
              key={blockIndex}
              className="overflow-x-auto rounded-md bg-stone-950 p-3 text-xs leading-5 text-stone-50"
            >
              <code>{code}</code>
            </pre>
          );
        }

        if (lines.every((line) => /^\s*[-*]\s+/.test(line))) {
          return (
            <ul key={blockIndex} className="list-disc space-y-1 pl-5">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>
                  {renderInlineMarkdown(line.replace(/^\s*[-*]\s+/, ""))}
                </li>
              ))}
            </ul>
          );
        }

        if (lines.every((line) => /^\s*\d+\.\s+/.test(line))) {
          return (
            <ol key={blockIndex} className="list-decimal space-y-1 pl-5">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>
                  {renderInlineMarkdown(line.replace(/^\s*\d+\.\s+/, ""))}
                </li>
              ))}
            </ol>
          );
        }

        if (/^#{1,3}\s+/.test(trimmedBlock)) {
          const text = trimmedBlock.replace(/^#{1,3}\s+/, "");

          return (
            <h3
              key={blockIndex}
              className="text-base font-semibold text-stone-950"
            >
              {renderInlineMarkdown(text)}
            </h3>
          );
        }

        return (
          <p key={blockIndex}>
            {lines.map((line, lineIndex) => (
              <Fragment key={lineIndex}>
                {lineIndex > 0 ? <br /> : null}
                {renderInlineMarkdown(line)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

type CareerCoachDashboardProps = {
  chatId?: string;
  history?: Message[];
};

export function CareerCoachDashboard({ chatId, history }: CareerCoachDashboardProps) {
  const [messages, setMessages] = useState<Message[]>(history ?? []);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [activeChatId, setActiveChatId] = useState(chatId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nextMessageId = useRef(2);
 console.log('messages', messages)
  const canSubmit =
    (message.trim().length > 0 || attachment !== null) &&
    uploadStatus !== "uploading" &&
    uploadStatus !== "failed" &&
    !isSending;

  async function selectFile(file: File | undefined) {
    if (!file) {
      return;
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
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

    setAttachment({
      file,
      name: file.name,
      size: file.size,
    });
    setUploadStatus("uploading");
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("chatId", chatId ?? "");

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || "Failed to process PDF");
      }

      const result = await response.json();
      setAttachment((currentAttachment) =>
        currentAttachment
          ? {
              ...currentAttachment,
              documentId: result.documentId,
            }
          : currentAttachment,
      );
      if (!activeChatId && result.chatId) {
        setActiveChatId(result.chatId);
      }
      setUploadStatus("ready");
    } catch (caughtError) {
      console.error("Error uploading PDF:", caughtError);
      setUploadStatus("failed");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to upload the PDF file.",
      );
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: React.DragEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files[0]);
  }

  async function submitMessage(nextMessage?: string) {
    const requestedContent = (nextMessage ?? message).trim();
    const content = requestedContent ||
      (attachment ? "Please review the attached file." : "");

    if (!content || isSending) {
      return;
    }

    const attachedFile = attachment;
    const userMessage: Message = {
      id: nextMessageId.current,
      role: "user",
      content,
      attachments: attachedFile?.documentId
        ? [
            {
              document: {
                id: attachedFile.documentId,
                name: attachedFile.name,
                storagePath: "",
                mimeType: attachedFile.file.type,
              },
            },
          ]
        : undefined,
    };
    nextMessageId.current += 1;

    const coachMessageId = nextMessageId.current;
    nextMessageId.current += 1;

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      {
        id: coachMessageId,
        role: "assistant",
        content: "",
      },
    ]);
    setMessage("");
    setError("");
    setIsSending(true);

    try {
      const requestBody = JSON.stringify({
        message: content,
        ...(activeChatId && { chatId: activeChatId }),
        ...(attachedFile?.documentId && {
          documentId: attachedFile.documentId,
        }),
      });
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
      });

      if (!response.ok || !response.body) {
        const errorText = await response.text();
        throw new Error(errorText || "Request failed");
      }
      // Capture chat ID returned by backend
      const responseChatId = response.headers.get("X-Chat-Id");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });

        setMessages((currentMessages) =>
          currentMessages.map((chatMessage) =>
            chatMessage.id === coachMessageId
              ? {
                  ...chatMessage,
                  content: chatMessage.content + chunk,
                }
              : chatMessage,
          ),
        );
      }
      if (!activeChatId && responseChatId) {
        setActiveChatId(responseChatId);
        window.history.replaceState(null, "", `/chat/${responseChatId}`);
      }
      setAttachment(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to reach the coach right now.",
      );
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitMessage();
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-4 sm:px-6">
        <header className="flex items-center justify-between gap-4 border-b border-stone-200 py-4">
          <div>
            <p className="text-sm font-medium text-teal-700">AI Career Coach</p>
            <h1 className="text-xl font-semibold text-stone-950">
              Chat with your coach
            </h1>
          </div>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md border border-stone-300 px-4 text-sm font-medium text-stone-700 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
          >
            Home
          </Link>
        </header>

        <section className="flex flex-1 py-5">
          <div className="flex min-h-[calc(100vh-7.5rem)] w-full flex-col rounded-lg border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-200 p-5">
              <h2 className="text-lg font-semibold text-stone-950">
                What can I help with?
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void submitMessage(prompt)}
                    disabled={isSending}
                    className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-left text-sm text-stone-700 transition hover:border-teal-500 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-stone-50 p-4 sm:p-5">
              {messages.map((chatMessage) => (
                <article
                  key={chatMessage.id}
                  className={`flex ${
                    chatMessage.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-lg px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[76%] ${
                      chatMessage.role === "user"
                        ? "bg-stone-950 text-white"
                        : "border border-stone-200 bg-white text-stone-700"
                    }`}
                  >
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] opacity-70">
                      {chatMessage.role === "user" ? "You" : "Coach"}
                    </p>
                    {chatMessage.role === "assistant" ? (
                      chatMessage.content ? (
                        <MarkdownMessage content={chatMessage.content} />
                      ) : (
                        <p className="text-stone-500">
                          Thinking through the next move...
                        </p>
                      )
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap">
                          {chatMessage.content}
                        </p>
                        {chatMessage.attachments?.map(({ document }) => (
                          <div
                            key={document.id}
                            className="mt-3 rounded-md border border-stone-600 bg-stone-800 px-3 py-2 text-xs text-stone-200"
                          >
                            <p className="font-medium">{document.name}</p>
                            <p className="mt-1 text-stone-400">PDF attachment</p>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <form
              onSubmit={handleSubmit}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-t border-stone-200 bg-white p-4 transition-colors sm:p-5 ${
                isDragging ? "bg-teal-50" : ""
              }`}
            >
              <label htmlFor="career-message" className="sr-only">
                Career question
              </label>
              <div className="rounded-2xl border border-stone-300 bg-white px-4 py-3 shadow-sm transition focus-within:border-stone-500 focus-within:ring-4 focus-within:ring-stone-100">
                {attachment ? (
                  <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-900">
                    <span className="truncate">{attachment.name}</span>
                    <span className="shrink-0 text-xs text-teal-700">
                      {(attachment.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAttachment(null);
                        setUploadStatus("idle");
                        setError("");
                      }}
                      aria-label={`Remove ${attachment.name}`}
                      className="ml-1 shrink-0 rounded-full px-1 text-lg leading-none text-teal-700 hover:bg-teal-100"
                    >
                      x
                    </button>
                    <span
                      className="shrink-0 text-xs font-medium"
                      role="status"
                      aria-live="polite"
                    >
                      {uploadStatus === "uploading"
                        ? "Uploading..."
                        : uploadStatus === "ready"
                          ? "Ready"
                          : "Upload failed"}
                    </span>
                  </div>
                ) : null}
                <textarea
                  id="career-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Message your career coach..."
                  rows={3}
                  maxLength={5000}
                  className="min-h-20 w-full resize-none bg-transparent text-sm leading-6 text-stone-950 outline-none placeholder:text-stone-400"
                />
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSending || uploadStatus === "uploading"}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-stone-300 px-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span aria-hidden="true" className="text-lg leading-none">+</span>
                      Add file
                    </button>
                    <span className="hidden text-xs text-stone-400 sm:inline">
                      PDF up to 5 MB
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    aria-label={isSending ? "Sending message" : "Send message"}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-stone-950 text-lg text-white transition hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-300"
                  >
                    <span aria-hidden="true">{isSending ? "..." : "^"}</span>
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p
                  className={`text-sm ${
                    error ? "text-red-600" : "text-stone-500"
                  }`}
                  role={error ? "alert" : undefined}
                >
                  {error ||
                    "Responses are tailored from the context you share."}
                </p>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
