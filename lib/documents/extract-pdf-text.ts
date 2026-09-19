import "server-only";

import { getPath } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

PDFParse.setWorker(getPath());

export async function extractPdfText(
  file: File,
): Promise<string> {
  const buffer = Buffer.from(
    await file.arrayBuffer(),
  );

  const parser = new PDFParse({
    data: buffer,
  });

  try {
    const result = await parser.getText();
    // console.log("Extracted text :\n", result.text);

    return result.text.replace(/--\s*\d+\s+of\s+\d+\s*--/gi, "").trim();
  } finally {
    await parser.destroy();
  }
}