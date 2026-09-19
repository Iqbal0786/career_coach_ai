const MAX_CHUNK_SIZE = 1200;
const MIN_CHUNK_SIZE = 300;
const CHUNK_OVERLAP = 150;

const RESUME_SECTIONS = [
  "summary",
  "objective",
  "career objective",
  "professional summary",
  "technical skills",
  "skills",
  "experience",
  "work experience",
  "professional experience",
  "employment",
  "projects",
  "personal projects",
  "education",
  "certifications",
  "certificates",
  "achievements",
  "awards",
  "soft skills",
  "languages",
  "interests",
  "hobbies",
];

/**
 * Splits resume text into section-aware chunks.
 *
 * Priority:
 * 1. Resume section boundaries
 * 2. Paragraph boundaries
 * 3. Sentence boundaries
 * 4. Word boundaries
 *
 * Sections are never intentionally mixed when they can fit
 * within the configured chunk size.
 */
export function chunkText(text: string): string[] {
  const normalizedText = normalizeText(text);

  if (!normalizedText) {
    return [];
  }

  const sections = splitIntoResumeSections(normalizedText);

  const chunks: string[] = [];

  for (const section of sections) {
    const sectionChunks = chunkSection(section);
    chunks.push(...sectionChunks);
  }

  return chunks;
}

function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitIntoResumeSections(text: string): string[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const sections: string[] = [];
  let currentSection: string[] = [];

  for (const line of lines) {
    if (isResumeSectionHeading(line)) {
      if (currentSection.length > 0) {
        sections.push(currentSection.join("\n"));
      }

      currentSection = [line];
      continue;
    }

    currentSection.push(line);
  }

  if (currentSection.length > 0) {
    sections.push(currentSection.join("\n"));
  }

  return sections;
}

function isResumeSectionHeading(line: string): boolean {
  const normalizedLine = line
    .replace(/[:\-]+$/, "")
    .trim()
    .toLowerCase();

  return RESUME_SECTIONS.includes(normalizedLine);
}

function chunkSection(section: string): string[] {
  if (section.length <= MAX_CHUNK_SIZE) {
    return [section];
  }

  const lines = section
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const heading = lines[0];
  const content = lines.slice(1);

  const chunks: string[] = [];
  let currentChunk = heading;

  for (const line of content) {
    const candidate = `${currentChunk}\n${line}`;

    if (candidate.length <= MAX_CHUNK_SIZE) {
      currentChunk = candidate;
      continue;
    }

    if (currentChunk !== heading) {
      chunks.push(currentChunk);
    }

    currentChunk = `${heading}\n${line}`;
  }

  if (currentChunk !== heading) {
    chunks.push(currentChunk);
  }

  return chunks.flatMap((chunk) => {
    if (chunk.length <= MAX_CHUNK_SIZE) {
      return [chunk];
    }

    return splitOversizedChunk(chunk);
  });
}

function splitOversizedChunk(text: string): string[] {
  const headingMatch = text.match(/^([^\n]+)\n/);
  const heading = headingMatch?.[1];
  const content = heading
    ? text.slice(heading.length).trim()
    : text;

  const sentences = content.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [];

  const chunks: string[] = [];
  let current = heading ? `${heading}\n` : "";

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();

    if (!trimmedSentence) {
      continue;
    }

    const candidate = current
      ? `${current} ${trimmedSentence}`
      : trimmedSentence;

    if (candidate.length <= MAX_CHUNK_SIZE) {
      current = candidate;
      continue;
    }

    if (current.trim()) {
      chunks.push(current.trim());
    }

    const overlap = createOverlap(current, CHUNK_OVERLAP);

    current = heading
      ? `${heading}\n${overlap} ${trimmedSentence}`.trim()
      : `${overlap} ${trimmedSentence}`.trim();
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return mergeSmallChunks(chunks);
}

function createOverlap(text: string, overlap: number): string {
  const content = text.split("\n").slice(1).join(" ").trim();

  if (!content || content.length <= overlap) {
    return content;
  }

  const start = content.length - overlap;
  const spaceIndex = content.indexOf(" ", start);

  return content
    .slice(spaceIndex >= 0 ? spaceIndex + 1 : start)
    .trim();
}

function mergeSmallChunks(chunks: string[]): string[] {
  const result: string[] = [];

  for (const chunk of chunks) {
    if (
      result.length > 0 &&
      chunk.length < MIN_CHUNK_SIZE &&
      result[result.length - 1].length + chunk.length <= MAX_CHUNK_SIZE
    ) {
      result[result.length - 1] += `\n${chunk}`;
    } else {
      result.push(chunk);
    }
  }

  return result;
}