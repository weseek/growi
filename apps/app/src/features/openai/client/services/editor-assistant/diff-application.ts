/**
 * Client-side Diff Application Engine for GROWI Editor Assistant
 * Handles direct integration with browser-based editors (yText/CodeMirror)
 * Optimized for real-time application with undo/redo support
 */

import type { LlmEditorAssistantDiff } from '../../../interfaces/editor-assistant/llm-response-schemas';
import type { SingleDiffResult, ProcessorConfig, SearchContext } from '../../../interfaces/editor-assistant/types';

import { ClientErrorHandler } from './error-handling';
import { ClientFuzzyMatcher } from './fuzzy-matching';

// -----------------------------------------------------------------------------
// Editor Integration Types
// -----------------------------------------------------------------------------

export interface EditorAdapter {
  /** Get current content as string */
  getContent(): string;
  /** Set content (for full replacement) */
  setContent(content: string): void;
  /** Replace text in specific range */
  replaceRange(startLine: number, endLine: number, newText: string): void;
  /** Get line count */
  getLineCount(): number;
  /** Get specific line content */
  getLine(lineNumber: number): string;
  /** Insert text at position */
  insertText(line: number, column: number, text: string): void;
  /** Delete text range */
  deleteRange(startLine: number, startCol: number, endLine: number, endCol: number): void;
  /** Create undo checkpoint */
  createUndoCheckpoint(): void;
}

// -----------------------------------------------------------------------------
// Client Diff Application Engine
// -----------------------------------------------------------------------------

export class ClientDiffApplicationEngine {

  private fuzzyMatcher: ClientFuzzyMatcher;

  private errorHandler: ClientErrorHandler;

  private config: Required<ProcessorConfig>;

  constructor(
      config: Partial<ProcessorConfig> = {},
      errorHandler?: ClientErrorHandler,
  ) {
    // Set defaults optimized for browser environment
    this.config = {
      fuzzyThreshold: config.fuzzyThreshold ?? 0.8,
      bufferLines: config.bufferLines ?? 40,
      preserveIndentation: config.preserveIndentation ?? true,
      stripLineNumbers: config.stripLineNumbers ?? true,
      enableAggressiveMatching: config.enableAggressiveMatching ?? false,
      maxDiffBlocks: config.maxDiffBlocks ?? 10,
    };

    this.fuzzyMatcher = new ClientFuzzyMatcher(this.config.fuzzyThreshold);
    this.errorHandler = errorHandler ?? new ClientErrorHandler();
  }

  /**
   * Apply a single diff to content with browser-optimized processing
   */
  applySingleDiff(
      content: string,
      diff: LlmEditorAssistantDiff,
      lineDelta = 0,
  ): SingleDiffResult {
    try {
      // Validate search content
      if (!diff.search.trim()) {
        return {
          success: false,
          error: this.errorHandler.createEmptySearchError(),
        };
      }

      const lines = content.split(/\r?\n/);

      // Calculate adjusted line numbers considering previous changes
      const searchContext = this.createSearchContext(diff, lineDelta);

      // Find the best match using fuzzy matching
      const matchResult = this.fuzzyMatcher.findBestMatch(
        content,
        diff.search,
        searchContext,
      );

      if (!matchResult.found) {
        return {
          success: false,
          error: this.errorHandler.createSearchNotFoundError(
            diff.search,
            matchResult,
            searchContext.startLine,
          ),
        };
      }

      // Apply the replacement with indentation preservation
      const replacementResult = this.applyReplacement(
        lines,
        matchResult,
        diff.replace,
      );

      return {
        success: true,
        updatedLines: replacementResult.lines,
        lineDelta: replacementResult.lineDelta,
      };

    }
    catch (error) {
      return {
        success: false,
        error: this.errorHandler.createContentError(
          error as Error,
          `Applying diff with search: "${diff.search.substring(0, 50)}..."`,
        ),
      };
    }
  }

  /**
   * Apply diff directly to an editor adapter with real-time integration
   */
  async applyDiffToEditor(
      editor: EditorAdapter,
      diff: LlmEditorAssistantDiff,
      options: {
      createCheckpoint?: boolean;
      preserveSelection?: boolean;
    } = {},
  ): Promise<SingleDiffResult> {
    const { createCheckpoint = true } = options;

    try {
      // Create undo checkpoint for easy reversal
      if (createCheckpoint) {
        editor.createUndoCheckpoint();
      }

      // Get current content
      const currentContent = editor.getContent();

      // Apply diff to content
      const result = this.applySingleDiff(currentContent, diff);

      if (!result.success || !result.updatedLines) {
        return result;
      }

      // Apply changes to editor
      const newContent = result.updatedLines.join('\n');
      editor.setContent(newContent);

      return result;

    }
    catch (error) {
      return {
        success: false,
        error: this.errorHandler.createContentError(
          error as Error,
          'Editor integration error',
        ),
      };
    }
  }

  /**
   * Apply multiple diffs in sequence with proper delta tracking
   */
  applyMultipleDiffs(
      content: string,
      diffs: LlmEditorAssistantDiff[],
  ): {
    success: boolean;
    finalContent?: string;
    appliedCount: number;
    results: SingleDiffResult[];
    errors: SingleDiffResult[];
  } {
    const results: SingleDiffResult[] = [];
    const errors: SingleDiffResult[] = [];
    let currentContent = content;
    let totalLineDelta = 0;
    let appliedCount = 0;

    // Sort diffs by line number (if available) to apply from bottom to top
    const sortedDiffs = this.sortDiffsForApplication(diffs);

    for (const diff of sortedDiffs) {
      const result = this.applySingleDiff(currentContent, diff, totalLineDelta);
      results.push(result);

      if (result.success && result.updatedLines) {
        currentContent = result.updatedLines.join('\n');
        totalLineDelta += result.lineDelta || 0;
        appliedCount++;
      }
      else {
        errors.push(result);
      }
    }

    return {
      success: errors.length === 0,
      finalContent: appliedCount > 0 ? currentContent : undefined,
      appliedCount,
      results,
      errors,
    };
  }

  // -----------------------------------------------------------------------------
  // Private Helper Methods
  // -----------------------------------------------------------------------------

  /**
   * Create search context with line adjustments
   */
  private createSearchContext(
      diff: LlmEditorAssistantDiff,
      lineDelta: number,
  ): SearchContext {
    return {
      startLine: diff.startLine ? diff.startLine + lineDelta : undefined,
      endLine: diff.endLine ? diff.endLine + lineDelta : undefined,
      bufferLines: this.config.bufferLines,
    };
  }

  /**
   * Apply replacement with indentation preservation
   */
  private applyReplacement(
      lines: string[],
      matchResult: { index: number; content: string },
      replaceText: string,
  ): { lines: string[]; lineDelta: number } {
    const startLineIndex = matchResult.index;
    const originalLines = matchResult.content.split('\n');
    const endLineIndex = startLineIndex + originalLines.length - 1;

    // Preserve indentation if enabled
    const processedReplaceText = this.config.preserveIndentation
      ? this.preserveIndentation(originalLines[0], replaceText)
      : replaceText;

    const replaceLines = processedReplaceText.split('\n');

    // Create new lines array with replacement
    const newLines = [
      ...lines.slice(0, startLineIndex),
      ...replaceLines,
      ...lines.slice(endLineIndex + 1),
    ];

    const lineDelta = replaceLines.length - originalLines.length;

    return {
      lines: newLines,
      lineDelta,
    };
  }

  /**
   * Preserve indentation pattern from original content
   */
  private preserveIndentation(originalLine: string, replaceText: string): string {
    // Extract indentation from the original line
    const indentMatch = originalLine.match(/^(\s*)/);
    const originalIndent = indentMatch ? indentMatch[1] : '';

    if (!originalIndent) {
      return replaceText;
    }

    // Apply the same indentation to all lines in replacement
    return replaceText
      .split('\n')
      .map((line, index) => {
        // Don't add indent to empty lines
        if (line.trim() === '') {
          return line;
        }
        // First line might already have partial indentation
        if (index === 0) {
          return originalIndent + line.replace(/^\s*/, '');
        }
        return originalIndent + line;
      })
      .join('\n');
  }

  /**
   * Sort diffs for optimal application order (bottom to top)
   */
  private sortDiffsForApplication(
      diffs: LlmEditorAssistantDiff[],
  ): LlmEditorAssistantDiff[] {
    return [...diffs].sort((a, b) => {
      // If both have line numbers, sort by line number (descending)
      if (a.startLine && b.startLine) {
        return b.startLine - a.startLine;
      }
      // If only one has line number, prioritize it
      if (a.startLine) return -1;
      if (b.startLine) return 1;
      // If neither has line number, keep original order
      return 0;
    });
  }

  // -----------------------------------------------------------------------------
  // Configuration and Utility Methods
  // -----------------------------------------------------------------------------

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ProcessorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.fuzzyMatcher.setThreshold(this.config.fuzzyThreshold);
  }

  /**
   * Get current configuration
   */
  getConfig(): Required<ProcessorConfig> {
    return { ...this.config };
  }

  /**
   * Validate diff before application
   */
  validateDiff(diff: LlmEditorAssistantDiff): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (!diff.search || !diff.search.trim()) {
      issues.push('Search content is empty');
    }

    if (diff.replace === undefined) {
      issues.push('Replace content is undefined');
    }

    if (diff.startLine && diff.endLine && diff.startLine > diff.endLine) {
      issues.push('Start line is greater than end line');
    }

    if (diff.search && diff.search.length > 10000) {
      issues.push('Search content is very large (>10k chars)');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Preview diff application without making changes
   */
  previewDiff(
      content: string,
      diff: LlmEditorAssistantDiff,
  ): {
    preview: string;
    success: boolean;
    changes: {
      added: number;
      removed: number;
      modified: number;
    };
  } {
    const result = this.applySingleDiff(content, diff);

    if (!result.success || !result.updatedLines) {
      return {
        preview: content,
        success: false,
        changes: { added: 0, removed: 0, modified: 0 },
      };
    }

    const newLines = result.updatedLines;

    return {
      preview: newLines.join('\n'),
      success: true,
      changes: {
        added: Math.max(0, result.lineDelta || 0),
        removed: Math.max(0, -(result.lineDelta || 0)),
        modified: 1, // At least one diff was applied
      },
    };
  }

}

// -----------------------------------------------------------------------------
// Browser-Specific Editor Adapters
// -----------------------------------------------------------------------------

/**
 * Simple textarea adapter for basic text inputs
 */
export class TextAreaAdapter implements EditorAdapter {

  // eslint-disable-next-line no-useless-constructor
  constructor(private textarea: HTMLTextAreaElement) {}

  getContent(): string {
    return this.textarea.value;
  }

  setContent(content: string): void {
    this.textarea.value = content;
  }

  replaceRange(startLine: number, endLine: number, newText: string): void {
    const lines = this.getContent().split('\n');
    const newLines = [
      ...lines.slice(0, startLine),
      newText,
      ...lines.slice(endLine + 1),
    ];
    this.setContent(newLines.join('\n'));
  }

  getLineCount(): number {
    return this.getContent().split('\n').length;
  }

  getLine(lineNumber: number): string {
    const lines = this.getContent().split('\n');
    return lines[lineNumber] || '';
  }

  insertText(line: number, column: number, text: string): void {
    // Basic implementation for textarea
    const lines = this.getContent().split('\n');
    const targetLine = lines[line] || '';
    lines[line] = targetLine.slice(0, column) + text + targetLine.slice(column);
    this.setContent(lines.join('\n'));
  }

  deleteRange(startLine: number, startCol: number, endLine: number, endCol: number): void {
    const lines = this.getContent().split('\n');

    if (startLine === endLine) {
      // Same line deletion
      const line = lines[startLine] || '';
      lines[startLine] = line.slice(0, startCol) + line.slice(endCol);
    }
    else {
      // Multi-line deletion
      const startLineContent = lines[startLine]?.slice(0, startCol) || '';
      const endLineContent = lines[endLine]?.slice(endCol) || '';
      lines.splice(startLine, endLine - startLine + 1, startLineContent + endLineContent);
    }

    this.setContent(lines.join('\n'));
  }

  createUndoCheckpoint(): void {
    // Textarea doesn't have built-in undo checkpoints
    // This would need to be implemented with a custom history system
  }

}

// -----------------------------------------------------------------------------
// Export Default Instance
// -----------------------------------------------------------------------------

/**
 * Default client diff application engine
 * Pre-configured for typical browser usage
 */
export const defaultClientDiffEngine = new ClientDiffApplicationEngine();
