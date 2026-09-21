import { ArrowUp, FileText, LoaderCircle, Paperclip, RotateCcw, X } from "lucide-react";
import type { ComposerProps } from "./types";

export function CareerCoachComposer({
  message,
  attachment,
  uploadStatus,
  isDragging,
  isSending,
  canSubmit,
  error,
  fileInputRef,
  onSubmit,
  onMessageChange,
  onFileChange,
  onDrop,
  onDragOver,
  onDragLeave,
  onOpenFilePicker,
  onRemoveAttachment,
  onRetryUpload,
  onRetryMessage,
  onSend,
}: ComposerProps) {
  return (
    <form onSubmit={onSubmit} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} className={`shrink-0 border-t-2 border-[#d8e1dc] bg-[#fbfaf6] px-4 pb-3 pt-3 sm:px-8 sm:pb-5 ${isDragging ? "bg-[#edf7f1]" : ""}`}>
      <label htmlFor="career-message" className="sr-only">Career question</label>
      <div className={`rounded-2xl border-2 bg-white p-2 shadow-[0_4px_18px_rgba(31,90,77,0.09)] transition focus-within:border-[#76a88f] focus-within:ring-4 focus-within:ring-[#dcece2] ${isDragging ? "border-[#76a88f]" : "border-[#e1e5e2]"}`}>
        {attachment ? (
          <div className="mx-1 mb-2 flex max-w-full items-center gap-3 rounded-xl border border-[#c9ddd1] bg-[#f1f8f3] px-3 py-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e5f3ea] text-[#1f5a4d]"><FileText size={15} /></span>
            <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-stone-700">{attachment.name}</span><span className="block text-[11px] text-stone-400">{(attachment.size / 1024 / 1024).toFixed(1)} MB · {uploadStatus === "uploading" ? "Processing..." : uploadStatus === "ready" ? "Ready to attach" : "Upload failed"}</span></span>
            {uploadStatus === "failed" ? <button type="button" onClick={onRetryUpload} aria-label={`Retry uploading ${attachment.name}`} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#1f5a4d] hover:bg-[#dcece2]"><RotateCcw size={15} /></button> : null}
            <button type="button" onClick={onRemoveAttachment} aria-label={`Remove ${attachment.name}`} className="flex h-7 w-7 items-center justify-center rounded-full text-stone-400 hover:bg-stone-200 hover:text-stone-950"><X size={16} /></button>
          </div>
        ) : null}
        <textarea id="career-message" value={message} onChange={onMessageChange} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); if (canSubmit) onSend(); } }} placeholder="Message Career Coach..." rows={2} maxLength={5000} className="min-h-16 w-full resize-none bg-transparent px-2 py-1 text-sm leading-6 text-stone-900 outline-none placeholder:text-stone-400" />
        <div className="flex items-center justify-between gap-3 px-1 pt-1">
          <div className="flex items-center gap-1">
            <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" onChange={onFileChange} className="sr-only" />
            <button type="button" onClick={onOpenFilePicker} disabled={isSending || uploadStatus === "uploading"} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-stone-500 hover:bg-[#eef5f0] hover:text-[#1f5a4d] disabled:opacity-50"><Paperclip size={15} /> Attach</button>
            <span className="hidden text-[11px] text-stone-400 sm:inline">PDF up to 5 MB</span>
          </div>
          <button type="submit" disabled={!canSubmit} aria-label={isSending ? "Sending message" : "Send message"} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1f5a4d] text-white transition hover:bg-[#17453b] disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400">{isSending ? <LoaderCircle size={16} className="animate-spin" /> : <ArrowUp size={16} strokeWidth={2.5} />}</button>
        </div>
      </div>
      <div className="mt-2 flex min-h-4 items-center justify-center gap-3 text-[11px]">
        <p className={error ? "text-red-600" : "text-stone-400"} role={error ? "alert" : undefined}>{error || "Career Coach can make mistakes. Check important information."}</p>
        {error ? <button type="button" onClick={onRetryMessage} disabled={isSending} className="font-semibold text-[#1f5a4d] underline underline-offset-2 disabled:opacity-50">Retry</button> : null}
      </div>
    </form>
  );
}
