import { jsonrepair } from 'jsonrepair';
import type { z } from 'zod';

import loggerFactory from '~/utils/logger';

import {
  type LlmEditorAssistantMessage,
  LlmEditorAssistantDiffSchema, type LlmEditorAssistantDiff,
} from '../../../interfaces/editor-assistant/llm-response-schemas';

const logger = loggerFactory('growi:routes:apiv3:openai:edit:editor-stream-processor');

/**
 * Type guard: Check if item is a message type
 */
const isMessageItem = (item: unknown): item is LlmEditorAssistantMessage => {
  return typeof item === 'object' && item !== null && 'message' in item;
};

/**
 * Type guard: Check if item is a diff type
 */
const isDiffItem = (item: unknown): item is LlmEditorAssistantDiff => {
  return typeof item === 'object' && item !== null
    && ('insert' in item || 'delete' in item || 'retain' in item);
};

type Options = {
  messageCallback?: (appendedMessage: string) => void,
  diffDetectedCallback?: (detected: LlmEditorAssistantDiff) => void,
  dataFinalizedCallback?: (message: string | null, replacements: LlmEditorAssistantDiff[]) => void,
}
/**
 * AI response stream processor for Editor Assisntant
 * Extracts messages and diffs from JSON stream for editor
 */
export class LlmResponseStreamProcessor {

  // Final response data
  private message: string | null = null;

  private replacements: LlmEditorAssistantDiff[] = [];

  // Index of the last element in previous content
  private lastContentIndex = -1;

  // Last sent diff index
  private lastSentDiffIndex = -1;

  // Set of sent diff keys
  private sentDiffKeys = new Set<string>();

  // Map to store previous messages by index
  private processedMessages: Map<number, string> = new Map();

  // Last processed content length - to optimize processing
  private lastProcessedContentLength = 0;

  constructor(
      private options?: Options,
  ) {
    this.options = options;
  }

  /**
   * Process JSON data
   * @param prevJsonString Previous JSON string
   * @param chunk New chunk of JSON string
   */
  process(prevJsonString: string, chunk: string): void {
    const jsonString = prevJsonString + chunk;

    try {
      const repairedJson = jsonrepair(jsonString);
      const parsedJson = JSON.parse(repairedJson);

      if (parsedJson?.contents && Array.isArray(parsedJson.contents)) {
        const contents = parsedJson.contents;

        // Index of the last element in current content
        const currentContentIndex = contents.length - 1;

        // Process messages - only process elements that might have changed
        // Start from the last processed length to avoid re-processing
        const startProcessingIndex = Math.min(this.lastProcessedContentLength, contents.length);

        // Process newly added elements and last element from previous batch (which might have changed)
        const processStartIndex = Math.max(0, startProcessingIndex - 1);

        for (let i = processStartIndex; i < contents.length; i++) {
          const item = contents[i];
          if (isMessageItem(item)) {
            const currentMessage = item.message;
            const previousMessage = this.processedMessages.get(i);

            // Only process if the message is new or changed
            if (previousMessage !== currentMessage) {
              let appendedContent: string;

              if (previousMessage == null) {
                // First occurrence of this message element - send the entire message
                appendedContent = currentMessage;
              }
              else {
                // Calculate the appended content since last update
                appendedContent = this.getAppendedContent(previousMessage, currentMessage);
              }

              // Update the stored message for this index
              this.processedMessages.set(i, currentMessage);

              // Update final message (for backward compatibility)
              this.message = currentMessage;

              // Only send if there's something to append
              if (appendedContent) {
                this.options?.messageCallback?.(appendedContent);
              }
            }
          }
        }

        // Update last processed content length for next iteration
        this.lastProcessedContentLength = contents.length;

        // Process diffs
        let diffUpdated = false;
        let processedDiffIndex = -1;

        // Check if diffs are included
        for (let i = 0; i < contents.length; i++) {
          const item = contents[i];
          if (!isDiffItem(item)) continue;

          const validDiff = LlmEditorAssistantDiffSchema.safeParse(item);
          if (!validDiff.success) continue;

          const diff = validDiff.data;
          const key = this.getDiffKey(diff, i);

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

        if (diffUpdated && processedDiffIndex > this.lastSentDiffIndex) {
          // For diffs, only notify if a new index diff is confirmed
          this.lastSentDiffIndex = processedDiffIndex;
          this.options?.diffDetectedCallback?.(this.replacements[this.replacements.length - 1]);
        }
      }
    }
    catch (e) {
      // Ignore parse errors (expected for incomplete JSON)
      logger.debug('JSON parsing error (expected for partial data):', e);
    }
  }

  /**
   * Calculate the appended content between previous and current message
   * @param previousMessage The previous complete message
   * @param currentMessage The current complete message
   * @returns The appended content (difference)
   */
  private getAppendedContent(previousMessage: string, currentMessage: string): string {
    // If current message is shorter, return empty string (shouldn't happen in normal flow)
    if (currentMessage.length <= previousMessage.length) {
      return '';
    }

    // Return the appended part
    return currentMessage.slice(previousMessage.length);
  }

  /**
   * Generate unique key for a diff
   */
  private getDiffKey(diff: LlmEditorAssistantDiff, index: number): string {
    if ('insert' in diff) return `insert-${index}`;
    if ('delete' in diff) return `delete-${index}`;
    if ('retain' in diff) return `retain-${index}`;
    return '';
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
        for (let i = 0; i < contents.length; i++) {
          const item = contents[i];
          if (!isDiffItem(item)) continue;

          const validDiff = LlmEditorAssistantDiffSchema.safeParse(item);
          if (!validDiff.success) continue;

          const diff = validDiff.data;
          const key = this.getDiffKey(diff, i);

          // Add any diffs that haven't been sent yet
          if (!this.sentDiffKeys.has(key)) {
            this.replacements.push(diff);
            this.sentDiffKeys.add(key);
          }
        }
      }

      // Final notification
      this.options?.dataFinalizedCallback?.(this.message, this.replacements);
    }
    catch (e) {
      logger.debug('Failed to parse final JSON response:', e);

      // Send final notification even on error
      this.options?.dataFinalizedCallback?.(this.message, this.replacements);
    }
  }

  /**
   * Release resources
   */
  destroy(): void {
    this.message = null;
    this.processedMessages.clear();
    this.replacements = [];
    this.sentDiffKeys.clear();
    this.lastContentIndex = -1;
    this.lastSentDiffIndex = -1;
    this.lastProcessedContentLength = 0;
  }

}
