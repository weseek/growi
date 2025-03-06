import { z } from 'zod';

import { LlmEditorAssistantDiffSchema } from './llm-response-schemas';

// -----------------------------------------------------------------------------
// Type definitions
// -----------------------------------------------------------------------------

// Schema definitions
export const SseMessageSchema = z.object({
  appendedMessage: z.string().describe('The message that should be appended to the chat window'),
});

export const SseDetectedDiffSchema = z
  .object({
    diff: LlmEditorAssistantDiffSchema,
  });

export const SseFinalizedSchema = z
  .object({
    finalized: z.object({
      message: z.string().describe('The final message that should be displayed in the chat window'),
      replacements: z.array(LlmEditorAssistantDiffSchema),
    }),
  });

// Type definitions
export type SseMessage = z.infer<typeof SseMessageSchema>;
export type SseDetectedDiff = z.infer<typeof SseDetectedDiffSchema>;
export type SseFinalized = z.infer<typeof SseFinalizedSchema>;
