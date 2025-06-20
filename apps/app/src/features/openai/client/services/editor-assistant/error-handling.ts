/**
 * Client-side Error Handling for GROWI Editor Assistant
 * Optimized for browser environment with real-time feedback
 * Provides detailed error information and user-friendly suggestions
 */

import type { DiffError, MatchResult } from '../../../interfaces/editor-assistant/types';

// -----------------------------------------------------------------------------
// Client Error Types and Constants
// -----------------------------------------------------------------------------

export const CLIENT_ERROR_MESSAGES = {
  SEARCH_NOT_FOUND: 'Search content not found in the document',
  SIMILARITY_TOO_LOW: 'Search content is too different from the closest match',
  MULTIPLE_MATCHES: 'Multiple similar matches found - search is ambiguous',
  EMPTY_SEARCH: 'Search content cannot be empty',
  CONTENT_ERROR: 'Invalid or corrupted content',
  TIMEOUT_ERROR: 'Search operation timed out',
  BROWSER_ERROR: 'Browser compatibility issue detected',
} as const;

export const CLIENT_SUGGESTIONS = {
  SEARCH_NOT_FOUND: [
    'Check for exact whitespace and formatting',
    'Try a smaller, more specific search pattern',
    'Verify line endings match your content',
    'Use the browser\'s search function to locate content first',
  ],
  SIMILARITY_TOO_LOW: [
    'Increase the similarity threshold in settings',
    'Use a more exact search pattern',
    'Check for typos or formatting differences',
    'Try searching for a unique phrase within the target',
  ],
  MULTIPLE_MATCHES: [
    'Add more context to make the search unique',
    'Include surrounding lines in your search',
    'Use line numbers to specify the exact location',
    'Search for a more specific pattern',
  ],
  EMPTY_SEARCH: [
    'Provide valid search content',
    'Check that your diff contains the search text',
  ],
  CONTENT_ERROR: [
    'Refresh the page and try again',
    'Check browser console for detailed errors',
    'Verify the document is properly loaded',
  ],
  TIMEOUT_ERROR: [
    'Try searching in a smaller section',
    'Reduce the document size if possible',
    'Check browser performance and memory usage',
  ],
  BROWSER_ERROR: [
    'Update to a modern browser version',
    'Check browser compatibility settings',
    'Try disabling browser extensions temporarily',
  ],
} as const;

// -----------------------------------------------------------------------------
// Client Error Handler Class
// -----------------------------------------------------------------------------

export class ClientErrorHandler {

  private readonly enableConsoleLogging: boolean;

  private readonly enableUserFeedback: boolean;

  constructor(enableConsoleLogging = true, enableUserFeedback = true) {
    this.enableConsoleLogging = enableConsoleLogging;
    this.enableUserFeedback = enableUserFeedback;
  }

  /**
   * Create a detailed error for search content not found
   */
  createSearchNotFoundError(
      searchContent: string,
      matchResult?: MatchResult,
      startLine?: number,
  ): DiffError {
    const lineRange = startLine ? ` (starting at line ${startLine})` : '';
    const similarityInfo = matchResult?.similarity
      ? ` (closest match: ${Math.floor(matchResult.similarity * 100)}%)`
      : '';

    const error: DiffError = {
      type: 'SEARCH_NOT_FOUND',
      message: `${CLIENT_ERROR_MESSAGES.SEARCH_NOT_FOUND}${lineRange}${similarityInfo}`,
      line: startLine,
      details: {
        searchContent,
        bestMatch: matchResult?.content,
        similarity: matchResult?.similarity,
        suggestions: [...CLIENT_SUGGESTIONS.SEARCH_NOT_FOUND],
        lineRange: startLine ? `starting at line ${startLine}` : 'entire document',
      },
    };

    this.logError(error, 'Search content not found');
    return error;
  }

  /**
   * Create a detailed error for similarity too low
   */
  createSimilarityTooLowError(
      searchContent: string,
      bestMatch: string,
      similarity: number,
      threshold: number,
      startLine?: number,
  ): DiffError {
    const error: DiffError = {
      type: 'SIMILARITY_TOO_LOW',
      message: `${CLIENT_ERROR_MESSAGES.SIMILARITY_TOO_LOW} (${Math.floor(similarity * 100)}% < ${Math.floor(threshold * 100)}%)`,
      line: startLine,
      details: {
        searchContent,
        bestMatch,
        similarity,
        suggestions: [
          `Current similarity: ${Math.floor(similarity * 100)}%, required: ${Math.floor(threshold * 100)}%`,
          ...CLIENT_SUGGESTIONS.SIMILARITY_TOO_LOW,
        ],
        correctFormat: this.generateCorrectFormat(searchContent, bestMatch),
      },
    };

    this.logError(error, 'Similarity too low');
    return error;
  }

  /**
   * Create a detailed error for multiple matches
   */
  createMultipleMatchesError(
      searchContent: string,
      matches: MatchResult[],
      startLine?: number,
  ): DiffError {
    const matchInfo = matches
      .slice(0, 3) // Show only first 3 matches
      .map((match, index) => `Match ${index + 1}: line ${match.index ? match.index + 1 : 'unknown'} (${Math.floor((match.similarity || 0) * 100)}%)`)
      .join(', ');

    const error: DiffError = {
      type: 'MULTIPLE_MATCHES',
      message: `${CLIENT_ERROR_MESSAGES.MULTIPLE_MATCHES}: ${matchInfo}`,
      line: startLine,
      details: {
        searchContent,
        suggestions: [
          `Found ${matches.length} similar matches`,
          ...CLIENT_SUGGESTIONS.MULTIPLE_MATCHES,
        ],
        lineRange: `Multiple locations: ${matchInfo}`,
      },
    };

    this.logError(error, 'Multiple matches found');
    return error;
  }

  /**
   * Create an error for empty search content
   */
  createEmptySearchError(): DiffError {
    const error: DiffError = {
      type: 'EMPTY_SEARCH',
      message: CLIENT_ERROR_MESSAGES.EMPTY_SEARCH,
      details: {
        searchContent: '',
        suggestions: [...CLIENT_SUGGESTIONS.EMPTY_SEARCH],
      },
    };

    this.logError(error, 'Empty search content');
    return error;
  }

  /**
   * Create an error for content/parsing issues
   */
  createContentError(
      originalError: Error,
      context?: string,
  ): DiffError {
    const error: DiffError = {
      type: 'CONTENT_ERROR',
      message: `${CLIENT_ERROR_MESSAGES.CONTENT_ERROR}: ${originalError.message}`,
      details: {
        searchContent: context || 'Unknown context',
        suggestions: [
          `Original error: ${originalError.message}`,
          ...CLIENT_SUGGESTIONS.CONTENT_ERROR,
        ],
      },
    };

    this.logError(error, 'Content processing error', originalError);
    return error;
  }

  /**
   * Create an error for browser timeout
   */
  createTimeoutError(
      searchContent: string,
      timeoutMs: number,
  ): DiffError {
    const error: DiffError = {
      type: 'CONTENT_ERROR', // Using CONTENT_ERROR as base type
      message: `${CLIENT_ERROR_MESSAGES.TIMEOUT_ERROR} (${timeoutMs}ms)`,
      details: {
        searchContent,
        suggestions: [
          `Search timed out after ${timeoutMs}ms`,
          ...CLIENT_SUGGESTIONS.TIMEOUT_ERROR,
        ],
      },
    };

    this.logError(error, 'Search timeout');
    return error;
  }

  /**
   * Create an error for browser compatibility issues
   */
  createBrowserError(
      feature: string,
      fallbackAvailable = false,
  ): DiffError {
    const error: DiffError = {
      type: 'CONTENT_ERROR',
      message: `${CLIENT_ERROR_MESSAGES.BROWSER_ERROR}: ${feature} not supported`,
      details: {
        searchContent: `Browser feature: ${feature}`,
        suggestions: [
          fallbackAvailable ? 'Using fallback implementation' : 'No fallback available',
          ...CLIENT_SUGGESTIONS.BROWSER_ERROR,
        ],
      },
    };

    this.logError(error, 'Browser compatibility issue');
    return error;
  }

  // -----------------------------------------------------------------------------
  // Utility Methods
  // -----------------------------------------------------------------------------

  /**
   * Generate a suggested correct format based on the best match
   */
  private generateCorrectFormat(searchContent: string, bestMatch: string): string {
    // Simple diff-like format for user guidance
    const searchLines = searchContent.split('\n');
    const matchLines = bestMatch.split('\n');

    if (searchLines.length === 1 && matchLines.length === 1) {
      return `Try: "${bestMatch}" instead of "${searchContent}"`;
    }

    return `Expected format based on closest match:\n${bestMatch}`;
  }

  /**
   * Log error to console (if enabled) with contextual information
   */
  private logError(
      error: DiffError,
      context: string,
      originalError?: Error,
  ): void {
    if (!this.enableConsoleLogging) {
      return;
    }

    const logData = {
      context,
      type: error.type,
      message: error.message,
      line: error.line,
      similarity: error.details.similarity,
      searchLength: error.details.searchContent?.length || 0,
      suggestions: error.details.suggestions?.length || 0,
    };

    // eslint-disable-next-line no-console
    console.warn('[ClientErrorHandler]', logData);

    if (originalError) {
      // eslint-disable-next-line no-console
      console.error('[ClientErrorHandler] Original error:', originalError);
    }
  }

  /**
   * Format error for user display
   */
  formatErrorForUser(error: DiffError): string {
    const suggestions = error.details.suggestions?.slice(0, 3).join('\n• ') || '';

    return `❌ ${error.message}\n\n💡 Suggestions:\n• ${suggestions}`;
  }

  /**
   * Create a user-friendly summary of multiple errors
   */
  createErrorSummary(errors: DiffError[]): string {
    if (errors.length === 0) {
      return '✅ No errors found';
    }

    if (errors.length === 1) {
      return this.formatErrorForUser(errors[0]);
    }

    const summary = `❌ ${errors.length} issues found:\n\n`;
    const errorList = errors
      .slice(0, 5) // Limit to first 5 errors
      .map((error, index) => `${index + 1}. ${error.message}`)
      .join('\n');

    const moreErrors = errors.length > 5 ? `\n... and ${errors.length - 5} more issues` : '';

    return summary + errorList + moreErrors;
  }

  // -----------------------------------------------------------------------------
  // Configuration Methods
  // -----------------------------------------------------------------------------

  /**
   * Check if console logging is enabled
   */
  isConsoleLoggingEnabled(): boolean {
    return this.enableConsoleLogging;
  }

  /**
   * Check if user feedback is enabled
   */
  isUserFeedbackEnabled(): boolean {
    return this.enableUserFeedback;
  }

}

// -----------------------------------------------------------------------------
// Utility Functions
// -----------------------------------------------------------------------------

/**
 * Quick error creation for common scenarios
 */
export function createQuickError(
    type: keyof typeof CLIENT_ERROR_MESSAGES,
    searchContent: string,
    additionalInfo?: string,
): DiffError {
  return {
    type: type as DiffError['type'],
    message: CLIENT_ERROR_MESSAGES[type] + (additionalInfo ? `: ${additionalInfo}` : ''),
    details: {
      searchContent,
      suggestions: [...(CLIENT_SUGGESTIONS[type] || ['Contact support for assistance'])],
    },
  };
}

/**
 * Validate browser support for required features
 */
export function validateBrowserSupport(): {
  supported: boolean;
  missing: string[];
  warnings: string[];
  } {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check for required APIs
  if (typeof performance === 'undefined' || typeof performance.now !== 'function') {
    missing.push('Performance API');
  }

  if (typeof String.prototype.normalize !== 'function') {
    missing.push('Unicode normalization');
  }

  // Check for optional but recommended features
  // eslint-disable-next-line no-console
  if (typeof console === 'undefined' || typeof console.warn !== 'function') {
    warnings.push('Console API limited');
  }

  return {
    supported: missing.length === 0,
    missing,
    warnings,
  };
}

// -----------------------------------------------------------------------------
// Export Default Instance
// -----------------------------------------------------------------------------

/**
 * Default client error handler instance
 * Pre-configured for typical browser usage
 */
export const defaultClientErrorHandler = new ClientErrorHandler(true, true);
