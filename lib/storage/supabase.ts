import "server-only";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export async function uploadDocument(file: File) {
  const storagePath = `documents/${crypto.randomUUID()}/${file.name}`;

  const { data, error } = await supabase.storage
    .from("media")
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload document: ${error.message}`);
  }

  return data.path;
}