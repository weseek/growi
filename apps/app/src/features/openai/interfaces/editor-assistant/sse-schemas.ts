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

// Enhanced finalized schema with detailed application results
export const SseFinalizedSchema = z.object({
  finalized: z.object({
    message: z.string()
      .describe('The final message that should be displayed in the chat window'),
    replacements: z.array(LlmEditorAssistantDiffSchema),
    // Enhanced error reporting from multi-search-replace processor
    applicationResult: z.object({
      success: z.boolean(),
      appliedCount: z.number().int().min(0),
      totalCount: z.number().int().min(0),
      failedParts: z.array(z.object({
        type: z.enum([
          'SEARCH_NOT_FOUND',
          'SIMILARITY_TOO_LOW',
          'MULTIPLE_MATCHES',
          'EMPTY_SEARCH',
          'MARKER_SEQUENCE_ERROR',
          'CONTENT_ERROR',
        ]),
        message: z.string(),
        line: z.number().int().positive().optional(),
        details: z.object({
          searchContent: z.string(),
          bestMatch: z.string().optional(),
          similarity: z.number().min(0).max(1).optional(),
          suggestions: z.array(z.string()),
          correctFormat: z.string().optional(),
          lineRange: z.string().optional(),
        }),
      })).optional(),
    }).optional(),
  }),
});

// Type definitions
export type SseMessage = z.infer<typeof SseMessageSchema>;
export type SseDetectedDiff = z.infer<typeof SseDetectedDiffSchema>;
export type SseFinalized = z.infer<typeof SseFinalizedSchema>;

// Helper functions for response type checking
export const hasApplicationResult = (finalized: SseFinalized): boolean => {
  return finalized.finalized.applicationResult !== undefined;
};
