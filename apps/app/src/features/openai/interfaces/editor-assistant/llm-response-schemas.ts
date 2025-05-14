import { z } from 'zod';

// -----------------------------------------------------------------------------
// Type definitions
// -----------------------------------------------------------------------------

// Schema definitions
export const LlmEditorAssistantMessageSchema = z.object({
  message: z.string().describe('A friendly message explaining what changes were made or suggested'),
});

export const LlmEditorAssistantDiffSchema = z
  .object({
    replace: z.string().describe('The text that should replace the current content'),
  });
  // .object({
  //   insert: z.string().describe('The text that should insert the content in the current position'),
  // })
  // .or(
  //   z.object({
  //     delete: z.number().int().describe('The number of characters that should be deleted from the current position'),
  //   }),
  // )
  // .or(
  //   z.object({
  //     retain: z.number().int().describe('The number of characters that should be retained in the current position'),
  //   }),
  // );

// Type definitions
export type LlmEditorAssistantMessage = z.infer<typeof LlmEditorAssistantMessageSchema>;
export type LlmEditorAssistantDiff = z.infer<typeof LlmEditorAssistantDiffSchema>;
