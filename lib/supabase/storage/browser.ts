export async function downloadDocument(storagePath: string, fileName: string) {
  const response = await fetch(`/api/documents/download?path=${encodeURIComponent(storagePath)}`);
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.url) throw new Error(result?.error || "Unable to create a PDF download URL");

  const fileResponse = await fetch(result.url);
  if (!fileResponse.ok) throw new Error("Unable to download the PDF from Supabase");

  const blobUrl = URL.createObjectURL(await fileResponse.blob());
  const downloadLink = window.document.createElement("a");
  downloadLink.href = blobUrl;
  downloadLink.download = fileName;
  downloadLink.click();
  URL.revokeObjectURL(blobUrl);
}