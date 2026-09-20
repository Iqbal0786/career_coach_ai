import { getAuthenticatedUser } from "@/lib/supabase/auth/server";
import { createDocumentDownloadUrl } from "@/lib/supabase/storage/server";

export async function GET(request: Request) {
  try {
    await getAuthenticatedUser();
    const storagePath = new URL(request.url).searchParams.get("path");

    if (!storagePath) {
      return Response.json({ error: "Document path is required" }, { status: 400 });
    }

    const url = await createDocumentDownloadUrl(storagePath);
    return Response.json({ url });
  } catch (error) {
    console.error("Failed to create document download URL:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to download document" },
      { status: 500 },
    );
  }
}