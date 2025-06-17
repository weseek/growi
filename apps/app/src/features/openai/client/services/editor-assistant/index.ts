/**
 * GROWI Editor Assistant - Client-side Services
 * Phase 2A: Browser-optimized engine implementation
 *
 * Compatible with existing useEditorAssistant hook and GROWI CodeMirror setup.
 * Provides specialized components for search/replace processing.
 */

// Core Processing Components
export { ClientFuzzyMatcher } from './fuzzy-matching';
export {
  clientNormalizeString,
  normalizeForBrowserFuzzyMatch,
  quickNormalizeForFuzzyMatch,
  defaultFuzzyNormalizer,
  quickNormalizer,
} from './text-normalization';
export { ClientErrorHandler } from './error-handling';
export { ClientDiffApplicationEngine } from './diff-application';
export { ClientSearchReplaceProcessor } from './processor';

// Re-export commonly used types
export type {
  ProcessingOptions,
  ProcessingResult,
  ProgressCallback,
  MatchResult,
} from '../../../interfaces/editor-assistant/types';
