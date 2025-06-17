/**
 * Enhanced types for GROWI Editor Assistant with roo-code compatible Search/Replace functionality
 */

// -----------------------------------------------------------------------------
// Configuration Types
// -----------------------------------------------------------------------------

export interface ProcessorConfig {
  /** Fuzzy matching threshold (0.0 to 1.0, default: 0.8) */
  fuzzyThreshold?: number;
  /** Number of buffer lines for context (default: 40) */
  bufferLines?: number;
  /** Whether to preserve original indentation (default: true) */
  preserveIndentation?: boolean;
  /** Whether to strip line numbers from content (default: true) */
  stripLineNumbers?: boolean;
  /** Enable aggressive matching for edge cases (default: false) */
  enableAggressiveMatching?: boolean;
  /** Maximum number of diff blocks per request (default: 10) */
  maxDiffBlocks?: number;
}

// -----------------------------------------------------------------------------
// Error Types
// -----------------------------------------------------------------------------

export type DiffErrorType =
  | 'SEARCH_NOT_FOUND'
  | 'SIMILARITY_TOO_LOW'
  | 'MULTIPLE_MATCHES'
  | 'EMPTY_SEARCH'
  | 'MARKER_SEQUENCE_ERROR'
  | 'CONTENT_ERROR';

export interface DiffError {
  type: DiffErrorType;
  message: string;
  line?: number;
  details: {
    searchContent: string;
    bestMatch?: string;
    similarity?: number;
    suggestions: string[];
    correctFormat?: string;
    lineRange?: string;
  };
}

// -----------------------------------------------------------------------------
// Result Types
// -----------------------------------------------------------------------------

export interface DiffApplicationResult {
  /** Whether the diff application was successful */
  success: boolean;
  /** Number of diffs successfully applied */
  appliedCount: number;
  /** Updated content if any diffs were applied */
  content?: string;
  /** Details of failed diff parts */
  failedParts?: DiffError[];
}

export interface SingleDiffResult {
  /** Whether this single diff was successful */
  success: boolean;
  /** Updated lines if successful */
  updatedLines?: string[];
  /** Line delta change (can be negative) */
  lineDelta?: number;
  /** Error details if failed */
  error?: DiffError;
}

// -----------------------------------------------------------------------------
// Fuzzy Matching Types
// -----------------------------------------------------------------------------

export interface MatchResult {
  /** Whether a match was found above threshold */
  found: boolean;
  /** Similarity score (0.0 to 1.0) */
  score: number;
  /** Starting line index of the match */
  index: number;
  /** Matched content */
  content: string;
  /** Threshold used for matching */
  threshold: number;
}

export interface SearchContext {
  /** Starting line number for search (1-based) */
  startLine?: number;
  /** Ending line number for search (1-based) */
  endLine?: number;
  /** Additional context lines around the search area */
  bufferLines: number;
}

// -----------------------------------------------------------------------------
// Validation Types
// -----------------------------------------------------------------------------

export interface ValidationResult {
  /** Whether validation passed */
  success: boolean;
  /** Error message if validation failed */
  error?: string;
  /** Line number where error occurred */
  line?: number;
  /** Suggested fixes */
  suggestions?: string[];
}

// -----------------------------------------------------------------------------
// Legacy Compatibility
// -----------------------------------------------------------------------------

/**
 * @deprecated Use the new Search/Replace format instead
 * Kept for backward compatibility during migration
 */
export interface LegacyReplaceOperation {
  replace: string;
}
