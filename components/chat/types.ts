import type { ChangeEvent, DragEvent, FormEvent } from "react";

export type Message = {
  id: number | string;
  role: "user" | "assistant";
  content: string;
  attachments?: {
    document: {
      id: string;
      name: string;
      storagePath: string;
      mimeType: string;
      url?: string;
    };
  }[];
};

export type Attachment = {
  file: File;
  name: string;
  size: number;
  documentId?: string;
  storagePath?: string;
  url?: string;
};

export type UploadStatus = "idle" | "uploading" | "ready" | "failed";

export type ComposerProps = {
  message: string;
  attachment: Attachment | null;
  uploadStatus: UploadStatus;
  isDragging: boolean;
  isSending: boolean;
  canSubmit: boolean;
  error: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onMessageChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: DragEvent<HTMLFormElement>) => void;
  onDragOver: (event: DragEvent<HTMLFormElement>) => void;
  onDragLeave: () => void;
  onOpenFilePicker: () => void;
  onRemoveAttachment: () => void;
  onSend: () => void;
};
