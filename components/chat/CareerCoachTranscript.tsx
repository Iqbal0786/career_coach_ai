import { ArrowUp, Check, ChevronDown, ChevronUp, Copy, Download, LoaderCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { downloadDocument as downloadSupabaseDocument } from "@/lib/supabase/storage/browser";
import type { ReactNode } from "react";
import type { Message } from "./types";

export const starterPrompts = [
  "Improve my resume for a product manager role.",
  "Make me a 30-day interview prep plan.",
  "Help me choose between two career paths.",
];

function renderInlineMarkdown(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={`${token}-${match.index}`}>{token.slice(2, -2)}</strong>);
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
      if (linkMatch) {
        parts.push(<a key={`${token}-${match.index}`} href={linkMatch[2]} target="_blank" rel="noreferrer" className="font-medium text-[#1f5a4d] underline underline-offset-2">{linkMatch[1]}</a>);
      }
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="space-y-3">
      {content.split(/\n{2,}/).map((block, blockIndex) => {
        const lines = block.split("\n");
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return null;
        if (trimmedBlock.startsWith("```")) {
          const code = trimmedBlock.replace(/^```[a-zA-Z0-9_-]*\n?/, "").replace(/```$/, "");
          return <pre key={blockIndex} className="overflow-x-auto rounded-xl bg-[#18332d] p-4 text-xs leading-5 text-[#edf8f1]"><code>{code}</code></pre>;
        }
        if (lines.every((line) => /^\s*[-*]\s+/.test(line))) {
          return <ul key={blockIndex} className="list-disc space-y-1 pl-5">{lines.map((line, index) => <li key={index}>{renderInlineMarkdown(line.replace(/^\s*[-*]\s+/, ""))}</li>)}</ul>;
        }
        if (lines.every((line) => /^\s*\d+\.\s+/.test(line))) {
          return <ol key={blockIndex} className="list-decimal space-y-1 pl-5">{lines.map((line, index) => <li key={index}>{renderInlineMarkdown(line.replace(/^\s*\d+\.\s+/, ""))}</li>)}</ol>;
        }
        if (/^#{1,3}\s+/.test(trimmedBlock)) return <h3 key={blockIndex} className="text-base font-semibold text-[#18332d]">{renderInlineMarkdown(trimmedBlock.replace(/^#{1,3}\s+/, ""))}</h3>;
        return <p key={blockIndex}>{lines.map((line, index) => <span key={index}>{index > 0 ? <br /> : null}{renderInlineMarkdown(line)}</span>)}</p>;
      })}
    </div>
  );
}

function DocumentDownloadButton({ document: attachmentDocument, isUser }: { document: NonNullable<Message["attachments"]>[number]["document"]; isUser: boolean }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  async function downloadDocument() {
    if (isDownloading || !attachmentDocument.storagePath) return;

    setIsDownloading(true);
    setDownloadError(false);
    try {
      await downloadSupabaseDocument(attachmentDocument.storagePath, attachmentDocument.name);
    } catch {
      setDownloadError(true);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <button type="button" onClick={() => void downloadDocument()} disabled={isDownloading || !attachmentDocument.storagePath} aria-busy={isDownloading} className={`mt-4 flex max-w-sm cursor-pointer items-center gap-3 rounded-xl border border-[#c9ddd1] bg-[#f7faf8] px-3 py-2.5 text-left transition hover:border-[#76a88f] hover:bg-[#edf7f1] disabled:cursor-wait disabled:opacity-70 ${isUser ? "ml-auto" : ""}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e5f3ea] text-[#1f5a4d]">{isDownloading ? <LoaderCircle size={15} className="animate-spin" /> : <Download size={15} />}</span>
      <span className="min-w-0"><span className="block truncate text-xs font-semibold text-stone-700">{attachmentDocument.name}</span><span className="block text-[.6875rem] text-stone-400">{isDownloading ? "Downloading..." : downloadError ? "Download failed, try again" : "Download PDF"}</span></span>
    </button>
  );
}

function CopyMessageButton({ content, isUser }: { content: string; isUser: boolean }) {
  const [isCopied, setIsCopied] = useState(false);
  const copyLabel = isUser ? "Copy message" : "Copy response";
  const copiedLabel = isUser ? "Message copied" : "Response copied";

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1600);
    } catch {
      setIsCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copyMessage()}
      title={isCopied ? copiedLabel : copyLabel}
      aria-label={isCopied ? copiedLabel : copyLabel}
      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 transition hover:bg-[#eaf4ee] hover:text-[#1f5a4d]"
    >
      {isCopied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

function UserMessageContent({ content }: { content: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = content.length > 600 || content.split("\n").length > 8;
  const visibleContent = isExpanded || !isLong ? content : `${content.slice(0, 600).trimEnd()}...`;

  return (
    <>
      <p className="whitespace-pre-wrap">{visibleContent}</p>
      {isLong ? (
        <button
          type="button"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#1f5a4d] hover:text-[#17453b]"
        >
          {isExpanded ? "Show less" : "Show more"}
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      ) : null}
    </>
  );
}

type CareerCoachTranscriptProps = {
  messages: Message[];
  isSending: boolean;
  transcriptRef: React.RefObject<HTMLDivElement | null>;
  onStarterPrompt: (prompt: string) => void;
};

export function CareerCoachTranscript({ messages, isSending, transcriptRef, onStarterPrompt }: CareerCoachTranscriptProps) {
  return (
    <div ref={transcriptRef} className="min-h-0 flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-center px-5 py-10 sm:px-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1f5a4d] text-white shadow-[0_.625rem_1.5625rem_rgba(31,90,77,0.2)]"><Sparkles size={21} strokeWidth={1.8} /></div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#18332d] sm:text-4xl">How can I help you today?</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-500">Ask about your next role, a difficult career decision, or share your resume for focused feedback.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {starterPrompts.map((prompt) => <button key={prompt} type="button" onClick={() => onStarterPrompt(prompt)} disabled={isSending} className="min-h-24 rounded-xl border-2 border-[#e1e5e2] bg-white p-4 text-left text-xs leading-5 text-stone-600 shadow-sm transition hover:border-[#9fc9af] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"><span className="mb-3 block text-[#ef8f6b]"><ArrowUp size={16} strokeWidth={2.2} /></span>{prompt}</button>)}
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
          <div className="space-y-10">
            {messages.map((chatMessage) => {
              const isUser = chatMessage.role === "user";

              return (
                <article key={chatMessage.id} className={`flex w-full gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                  {!isUser ? (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1f5a4d] text-xs font-semibold text-white">A</div>
                  ) : null}
                  <div className={`min-w-0 max-w-[88%] text-sm leading-7 text-stone-800 sm:max-w-[72%] ${isUser ? "items-end" : "items-start"}`}>
                    <p className={`mb-1 text-xs font-semibold text-stone-500 ${isUser ? "text-right" : ""}`}>
                      {isUser ? "You" : "Career Coach"}
                    </p>
                    <div className={isUser ? "rounded-2xl rounded-br-md bg-[#e3f1e8] px-4 py-3 text-[#18332d]" : "px-1 py-1"}>
                      {isUser ? <UserMessageContent content={chatMessage.content} /> : chatMessage.content ? <MarkdownMessage content={chatMessage.content} /> : <p className="text-stone-400">Thinking<span className="animate-pulse">...</span></p>}
                      {chatMessage.attachments?.map(({ document }) => <DocumentDownloadButton key={document.id} document={document} isUser={isUser} />)}
                    </div>
                    {chatMessage.content ? <div className={`mt-1 flex ${isUser ? "justify-end" : "justify-start"}`}><CopyMessageButton content={chatMessage.content} isUser={isUser} /></div> : null}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
