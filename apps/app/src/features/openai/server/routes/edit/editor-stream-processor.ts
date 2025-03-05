import { jsonrepair } from 'jsonrepair';
import type { z } from 'zod';

import loggerFactory from '~/utils/logger';

import type { SseHelper } from '../utils/sse-helper';

import type { EditorAssistantMessageSchema } from './schema';
import { EditorAssistantDiffSchema } from './schema';

const logger = loggerFactory('growi:routes:apiv3:openai:edit:editor-stream-processor');

// Type definitions
type EditorAssistantMessage = z.infer<typeof EditorAssistantMessageSchema>;
type EditorAssistantDiff = z.infer<typeof EditorAssistantDiffSchema>;

/**
 * Type guard: Check if item is a message type
 */
const isMessageItem = (item: unknown): item is EditorAssistantMessage => {
  return typeof item === 'object' && item !== null && 'message' in item;
};

/**
 * Type guard: Check if item is a diff type
 */
const isDiffItem = (item: unknown): item is EditorAssistantDiff => {
  return typeof item === 'object' && item !== null
    && ('insert' in item || 'delete' in item || 'retain' in item);
};

/**
 * Editor Stream Processor
 * Extracts messages and diffs from JSON stream for editor
 */
export class EditorStreamProcessor {

  // Final response data
  private message: string | null = null;

  private replacements: EditorAssistantDiff[] = [];

  // Index of the last element in previous content
  private lastContentIndex = -1;

  // Last sent diff index
  private lastSentDiffIndex = -1;

  // Set of sent diff keys
  private sentDiffKeys = new Set<string>();

  constructor(private sseHelper: SseHelper) {
    this.sseHelper = sseHelper;
  }

  /**
   * Process JSON data
   * @param jsonString JSON string
   */
  process(jsonString: string): void {
    try {
      const repairedJson = jsonrepair(jsonString);
      const parsedJson = JSON.parse(repairedJson);

      if (parsedJson?.contents && Array.isArray(parsedJson.contents)) {
        const contents = parsedJson.contents;

        // Index of the last element in current content
        const currentContentIndex = contents.length - 1;

        // Process message
        let messageUpdated = false;
        for (let i = contents.length - 1; i >= 0; i--) {
          const item = contents[i];
          if (isMessageItem(item)) {
            if (this.message !== item.message) {
              this.message = item.message;
              messageUpdated = true;
            }
            break;
          }
        }

        // Process diffs
        let diffUpdated = false;
        let processedDiffIndex = -1;

        // Check if diffs are included
        for (let i = 0; i < contents.length; i++) {
          const item = contents[i];
          if (!isDiffItem(item)) continue;

          const validDiff = EditorAssistantDiffSchema.safeParse(item);
          if (!validDiff.success) continue;

          const diff = validDiff.data;
          const key = this.getDiffKey(diff);

          // Check if this diff has already been sent
          if (this.sentDiffKeys.has(key)) continue;

          // If the last element has changed, or if this is not the last element
          // → Consider the diff as finalized
          if (i < currentContentIndex || currentContentIndex > this.lastContentIndex) {
            this.replacements.push(diff);
            this.sentDiffKeys.add(key);
            diffUpdated = true;
            processedDiffIndex = Math.max(processedDiffIndex, i);
          }
        }

        // Update last index
        this.lastContentIndex = currentContentIndex;

        // Send notifications
        if (messageUpdated) {
          // Notify immediately if message is updated
          this.notifyClient();
        }
        else if (diffUpdated && processedDiffIndex > this.lastSentDiffIndex) {
          // For diffs, only notify if a new index diff is confirmed
          this.lastSentDiffIndex = processedDiffIndex;
          this.notifyClient();
        }
      }
    }
    catch (e) {
      // Ignore parse errors (expected for incomplete JSON)
      logger.debug('JSON parsing error (expected for partial data):', e);
    }
  }

  /**
   * Generate unique key for a diff
   */
  private getDiffKey(diff: EditorAssistantDiff): string {
    if ('insert' in diff) return `insert-${diff.insert}`;
    if ('delete' in diff) return `delete-${diff.delete}`;
    if ('retain' in diff) return `retain-${diff.retain}`;
    return '';
  }

  /**
   * Notify the client
   */
  private notifyClient(): void {
    this.sseHelper.writeData({
      editorResponse: {
        message: this.message || '',
        replacements: this.replacements,
      },
    });
  }

  /**
   * Send final result
   */
  sendFinalResult(rawBuffer: string): void {
    try {
      const repairedJson = jsonrepair(rawBuffer);
      const parsedJson = JSON.parse(repairedJson);

      // Get all diffs from the final data
      if (parsedJson?.contents && Array.isArray(parsedJson.contents)) {
        const contents = parsedJson.contents;

        // Add any unsent diffs
        for (const item of contents) {
          if (!isDiffItem(item)) continue;

          const validDiff = EditorAssistantDiffSchema.safeParse(item);
          if (!validDiff.success) continue;

          const diff = validDiff.data;
          const key = this.getDiffKey(diff);

          // Add any diffs that haven't been sent yet
          if (!this.sentDiffKeys.has(key)) {
            this.replacements.push(diff);
            this.sentDiffKeys.add(key);
          }
        }
      }

      // Final notification (with isDone flag)
      this.sseHelper.writeData({
        editorResponse: {
          message: this.message || '',
          replacements: this.replacements,
        },
        isDone: true,
      });
    }
    catch (e) {
      logger.debug('Failed to parse final JSON response:', e);

      // Send final notification even on error
      this.sseHelper.writeData({
        editorResponse: {
          message: this.message || '',
          replacements: this.replacements,
        },
        isDone: true,
      });
    }
  }

  /**
   * Release resources
   */
  destroy(): void {
    this.message = null;
    this.replacements = [];
    this.sentDiffKeys.clear();
    this.lastContentIndex = -1;
    this.lastSentDiffIndex = -1;
  }

}
