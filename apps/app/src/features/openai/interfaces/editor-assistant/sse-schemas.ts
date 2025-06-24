import { z } from 'zod';

import { LlmEditorAssistantDiffSchema } from './llm-response-schemas';

// -----------------------------------------------------------------------------
// SSE Schemas for Streaming Editor Assistant
// -----------------------------------------------------------------------------

export const SseMessageSchema = z.object({
  appendedMessage: z.string()
    .describe('The message that should be appended to the chat window'),
});

export const SseDetectedDiffSchema = z.object({
  diff: LlmEditorAssistantDiffSchema,
});

// Simplified finalized schema
export const SseFinalizedSchema = z.object({
  success: z.boolean(),
});

// Type definitions
export type SseMessage = z.infer<typeof SseMessageSchema>;
export type SseDetectedDiff = z.infer<typeof SseDetectedDiffSchema>;
export type SseFinalized = z.infer<typeof SseFinalizedSchema>;
