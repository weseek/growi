import { z } from 'zod';

// -----------------------------------------------------------------------------
// 型定義
// -----------------------------------------------------------------------------

// スキーマ定義
export const EditorAssistantMessageSchema = z.object({
  message: z.string().describe('A friendly message explaining what changes were made or suggested'),
});

export const EditorAssistantDiffSchema = z
  .object({
    insert: z.string().describe('The text that should insert the content in the current position'),
  })
  .or(
    z.object({
      delete: z.number().int().describe('The number of characters that should be deleted from the current position'),
    }),
  )
  .or(
    z.object({
      retain: z.number().int().describe('The number of characters that should be retained in the current position'),
    }),
  );
