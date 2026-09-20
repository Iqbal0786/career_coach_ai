import "server-only";

import { createClient } from "@/lib/supabase/server";

export const DOCUMENTS_BUCKET = "media";

export async function uploadDocument(file: File) {
  const supabase = await createClient();
  const storagePath = `documents/${crypto.randomUUID()}/${file.name}`;

  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload document to bucket "${DOCUMENTS_BUCKET}": ${error.message}`);
  }

  return data.path;
}

export async function createDocumentDownloadUrl(
  storagePath: string,
  expiresIn = 60,
) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error) {
    throw new Error(`Failed to create download URL from bucket "${DOCUMENTS_BUCKET}": ${error.message}`);
  }

  return data.signedUrl;
}