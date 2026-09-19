import { z } from "zod";

export const chatSchema = z.object({
  chatId: z.string().trim().min(1, "Invalid chat ID").optional(),

  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(5000, "Message must be 5000 characters or less"),
    
});

export type ChatInput = z.infer<typeof chatSchema>;