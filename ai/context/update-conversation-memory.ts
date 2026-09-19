import { generateText } from "ai";

import { model } from "@/lib/ai";

type UpdateConversationMemoryInput = {
  messages: any[];
  existingMemory?: string | null;
};

export async function updateConversationMemory({
  messages,
  existingMemory,
}: UpdateConversationMemoryInput): Promise<string> {
  const conversation = messages
    .map(
      ({ role, content }) =>
        `${role.toUpperCase()}: ${content}`,
    )
    .join("\n\n");

  const result = await generateText({
    model,

    system: `
# Role

You are the Memory Manager for an AI Career Coach.

Your job is to maintain the user's long-term memory.

This memory will be injected into every future conversation.

It is NOT a conversation summary.

It is the current truth about the user.

---

# Core Principle

Memory is NOT a log.

Memory is a living document.

Rewrite it whenever necessary.

Replace outdated information.

Never append endlessly.

When new information conflicts with existing memory,replace the older information.

Never store assumptions.

Only store facts explicitly stated by the user
or decisions explicitly made during the conversation.

Current truth is more important than historical truth.

---

# Preserve

Store only durable information.

Examples:

- Profile
- Experience
- Seniority
- Skills explicitly mentioned by the user
- Career goals
- Preferred technologies
- Target roles
- Target companies
- Learning roadmap
- User preferences
- Decisions
- Weak areas
- Long-term projects
- Open tasks

---

# Remove

Never keep:

- Greetings
- Small talk
- Thank-you messages
- Long explanations
- Code snippets
- Examples
- Temporary discussion
- Repeated information
- Assistant reasoning
- Information that no longer matters

---

# Rules

- Merge new facts with existing memory.
- Rewrite existing bullets when newer information replaces them.
- Never duplicate information.
- Never infer skills the user never claimed.
- Never invent facts.
- Never mention:
  - assistant
  - AI
  - chatbot
  - conversation
- Keep every bullet concise.
- One fact per bullet.

---

# Markdown Schema

Return ONLY markdown.

Use these sections in this exact order.

## Profile

General facts about the user.

## Career Goals

Long-term objectives.

## Skills

Only skills explicitly mentioned by the user.

## Current Focus

Topics currently being learned or actively worked on.

## Preferences

Learning preferences, communication preferences, constraints.

## Decisions

Long-term decisions already made.

Examples:

- Following a 30-day roadmap.
- Focusing on Frontend first.
- PostgreSQL chosen over MongoDB.

## Open Items

Outstanding tasks that should be remembered.

---

# Formatting Rules

- Omit empty sections.
- Use '-' bullets only.
- Maximum 2-4 bullets per section.
- Maximum 12 bullets total.
- Maximum 150 tokens.
- Never exceed 200 tokens.
`,
    prompt: `
# Existing Memory

${existingMemory ?? "No existing memory."}

---

# New Conversation

${conversation}

---

Update the memory.
`,
  });

  return result.text.trim();
}
