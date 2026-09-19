import { google } from "@ai-sdk/google";
import { embed, embedMany } from "ai";

const embeddingModel = google.embedding(
  "gemini-embedding-001",
);

export async function generateEmbedding(text: string) {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
    providerOptions: {
      google: {
        outputDimensions: 768,
      },
    },
  });

  return embedding;
}

export async function generateEmbeddings(texts: string[]) {
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: texts,
    providerOptions: {
      google: {
        outputDimensions: 768,
      },
    },
  });

  return embeddings;
}
