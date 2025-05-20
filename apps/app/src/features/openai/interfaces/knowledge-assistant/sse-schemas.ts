import { z } from 'zod';

// Schema definitions
export const SseMessageSchema = z.object({
  content: z.array(z.object({
    index: z.number(),
    type: z.string(),
    text: z.object({
      value: z.string().describe('The message that should be appended to the chat window'),
    }),
  })),
});


// Type definitions
export type SseMessage = z.infer<typeof SseMessageSchema>;
