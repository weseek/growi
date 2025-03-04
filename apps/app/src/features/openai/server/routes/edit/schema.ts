import { z } from 'zod';

// -----------------------------------------------------------------------------
// 型定義
// -----------------------------------------------------------------------------

// スキーマ定義
export const EditorAssistantMessageSchema = z.object({
  message: z.string().describe('A friendly message explaining what changes were made or suggested'),
});

export const EditorAssistantDiffSchema = z.object({
  start: z.number().int().describe('Zero-based index where replacement should begin'),
  end: z.number().int().describe('Zero-based index where replacement should end'),
  text: z.string().describe('The text that should replace the content between start and end positions'),
});
