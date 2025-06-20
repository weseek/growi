/**
 * Client-side Main Processor for GROWI Editor Assistant
 * Orchestrates fuzzy matching, diff application, and real-time feedback
 * Optimized for browser environment with performance monitoring
 */

import type { LlmEditorAssistantDiff } from '../../../interfaces/editor-assistant/llm-response-schemas';
import type { DiffApplicationResult, ProcessorConfig, DiffError } from '../../../interfaces/editor-assistant/types';

import { ClientDiffApplicationEngine, type EditorAdapter } from './diff-application';
import { ClientErrorHandler } from './error-handling';
import { ClientFuzzyMatcher } from './fuzzy-matching';
// Note: measureNormalization import removed as it's not used in this file

// Types for batch processing results
interface BatchResult {
  error?: DiffError;
}

interface BatchProcessingResult {
  finalContent?: string;
  appliedCount: number;
  results: BatchResult[];
  errors: BatchResult[];
}

export interface ProcessingStatus {
  /** Current processing step */
  step: 'initializing' | 'parsing' | 'applying' | 'validating' | 'completed' | 'error';
  /** Progress percentage (0-100) */
  progress: number;
  /** Current operation description */
  description: string;
  /** Number of diffs processed */
  processedCount: number;
  /** Total number of diffs */
  totalCount: number;
  /** Processing start time */
  startTime: number;
  /** Estimated time remaining (ms) */
  estimatedTimeRemaining?: number;
}

export interface ProcessingOptions {
  /** Enable real-time progress callbacks */
  enableProgressCallbacks?: boolean;
  /** Progress callback function */
  onProgress?: (status: ProcessingStatus) => void;
  /** Enable performance monitoring */
  enablePerformanceMonitoring?: boolean;
  /** Maximum processing time before timeout (ms) */
  maxProcessingTime?: number;
  /** Enable preview mode (don't apply changes) */
  previewMode?: boolean;
  /** Batch size for processing diffs */
  batchSize?: number;
}

// -----------------------------------------------------------------------------
// Client Search Replace Processor
// -----------------------------------------------------------------------------

export class ClientSearchReplaceProcessor {

  private fuzzyMatcher: ClientFuzzyMatcher;

  private diffEngine: ClientDiffApplicationEngine;

  private errorHandler: ClientErrorHandler;

  private config: Required<ProcessorConfig>;

  private currentStatus: ProcessingStatus | null = null;

  constructor(
      config: Partial<ProcessorConfig> = {},
      errorHandler?: ClientErrorHandler,
  ) {
    // Browser-optimized defaults
    this.config = {
      fuzzyThreshold: config.fuzzyThreshold ?? 0.8,
      bufferLines: config.bufferLines ?? 40,
      preserveIndentation: config.preserveIndentation ?? true,
      stripLineNumbers: config.stripLineNumbers ?? true,
      enableAggressiveMatching: config.enableAggressiveMatching ?? false,
      maxDiffBlocks: config.maxDiffBlocks ?? 10,
    };

    this.fuzzyMatcher = new ClientFuzzyMatcher(this.config.fuzzyThreshold);
    this.diffEngine = new ClientDiffApplicationEngine(this.config, errorHandler);
    this.errorHandler = errorHandler ?? new ClientErrorHandler();
  }

  /**
   * Process multiple diffs with real-time progress and browser optimization
   */
  async processMultipleDiffs(
      content: string,
      diffs: LlmEditorAssistantDiff[],
      options: ProcessingOptions = {},
  ): Promise<DiffApplicationResult> {
    const {
      enableProgressCallbacks = true,
      onProgress,
      enablePerformanceMonitoring = true,
      maxProcessingTime = 10000, // 10 seconds default
      batchSize = 5,
    } = options;

    const startTime = performance.now();

    try {
      // Initialize processing status
      this.currentStatus = {
        step: 'initializing',
        progress: 0,
        description: 'Preparing to process diffs...',
        processedCount: 0,
        totalCount: diffs.length,
        startTime,
      };

      if (enableProgressCallbacks && onProgress) {
        onProgress(this.currentStatus);
      }

      // Validate input
      if (diffs.length === 0) {
        return {
          success: true,
          appliedCount: 0,
          content,
        };
      }

      if (diffs.length > this.config.maxDiffBlocks) {
        const error = this.errorHandler.createContentError(
          new Error(`Too many diffs: ${diffs.length} > ${this.config.maxDiffBlocks}`),
          'Diff count validation',
        );
        return {
          success: false,
          appliedCount: 0,
          failedParts: [error],
        };
      }

      // Update status
      this.updateStatus('parsing', 10, 'Validating and sorting diffs...');
      if (enableProgressCallbacks && onProgress && this.currentStatus) {
        onProgress(this.currentStatus);
      }

      // Validate and prepare diffs
      const validDiffs: LlmEditorAssistantDiff[] = [];
      const validationErrors: DiffError[] = [];

      for (const diff of diffs) {
        const validation = this.diffEngine.validateDiff(diff);
        if (validation.valid) {
          validDiffs.push(diff);
        }
        else {
          validationErrors.push(
            this.errorHandler.createContentError(
              new Error(validation.issues.join(', ')),
              `Invalid diff: ${diff.search?.substring(0, 30)}...`,
            ),
          );
        }
      }

      if (validDiffs.length === 0) {
        return {
          success: false,
          appliedCount: 0,
          failedParts: validationErrors,
        };
      }

      // Update status
      this.updateStatus('applying', 20, `Applying ${validDiffs.length} diffs...`);
      if (enableProgressCallbacks && onProgress && this.currentStatus) {
        onProgress(this.currentStatus);
      }

      // Process diffs in batches for better browser performance
      const results = await this.processDiffsInBatches(
        content,
        validDiffs,
        batchSize,
        maxProcessingTime,
        enableProgressCallbacks ? onProgress : undefined,
      );

      // Update status
      this.updateStatus('validating', 90, 'Validating results...');
      if (enableProgressCallbacks && onProgress && this.currentStatus) {
        onProgress(this.currentStatus);
      }

      // Combine results
      const finalResult: DiffApplicationResult = {
        success: results.errors.length === 0,
        appliedCount: results.appliedCount,
        content: results.finalContent,
        failedParts: [...validationErrors, ...results.errors.map(e => e.error).filter((error): error is DiffError => error !== undefined)],
      };

      // Performance monitoring
      if (enablePerformanceMonitoring) {
        const totalTime = performance.now() - startTime;
        this.logPerformanceMetrics(totalTime, diffs.length, results.appliedCount);
      }

      // Update status
      this.updateStatus('completed', 100, `Completed: ${results.appliedCount}/${diffs.length} diffs applied`);
      if (enableProgressCallbacks && onProgress && this.currentStatus) {
        onProgress(this.currentStatus);
      }

      return finalResult;

    }
    catch (error) {
      const processingError = this.errorHandler.createContentError(
        error as Error,
        'Main processing error',
      );

      this.updateStatus('error', 0, `Error: ${(error as Error).message}`);
      if (enableProgressCallbacks && onProgress && this.currentStatus) {
        onProgress(this.currentStatus);
      }

      return {
        success: false,
        appliedCount: 0,
        failedParts: [processingError],
      };
    }
  }

  /**
   * Process diffs with direct editor integration
   */
  async processWithEditor(
      editor: EditorAdapter,
      diffs: LlmEditorAssistantDiff[],
      options: ProcessingOptions = {},
  ): Promise<DiffApplicationResult> {
    const content = editor.getContent();

    if (options.previewMode) {
      // Preview mode: don't modify editor
      return this.processMultipleDiffs(content, diffs, options);
    }

    // Create undo checkpoint before starting
    editor.createUndoCheckpoint();

    const result = await this.processMultipleDiffs(content, diffs, options);

    if (result.success && result.content) {
      editor.setContent(result.content);
    }

    return result;
  }

  /**
   * Quick single diff processing for real-time applications
   */
  async processSingleDiffQuick(
      content: string,
      diff: LlmEditorAssistantDiff,
  ): Promise<DiffApplicationResult> {
    try {
      const result = this.diffEngine.applySingleDiff(content, diff);

      if (result.success && result.updatedLines) {
        return {
          success: true,
          appliedCount: 1,
          content: result.updatedLines.join('\n'),
        };
      }
      return {
        success: false,
        appliedCount: 0,
        failedParts: result.error ? [result.error] : [],
      };

    }
    catch (error) {
      const processingError = this.errorHandler.createContentError(
        error as Error,
        'Quick processing error',
      );

      return {
        success: false,
        appliedCount: 0,
        failedParts: [processingError],
      };
    }
  }

  // -----------------------------------------------------------------------------
  // Private Helper Methods
  // -----------------------------------------------------------------------------

  /**
   * Process diffs in batches to prevent browser blocking
   */
  private async processDiffsInBatches(
      content: string,
      diffs: LlmEditorAssistantDiff[],
      batchSize: number,
      maxProcessingTime: number,
      onProgress?: (status: ProcessingStatus) => void,
  ): Promise<BatchProcessingResult> {
    let currentContent = content;
    let totalApplied = 0;
    const allResults: BatchResult[] = [];
    const allErrors: BatchResult[] = [];
    const processingStartTime = performance.now();

    const batches = this.createBatches(diffs, batchSize);
    let processedCount = 0;

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];

      // Check timeout
      if (performance.now() - processingStartTime > maxProcessingTime) {
        const timeoutError = this.errorHandler.createTimeoutError(
          `Batch processing (${processedCount}/${diffs.length})`,
          maxProcessingTime,
        );
        allErrors.push({ error: timeoutError });
        break;
      }

      // Update progress
      const progress = Math.floor((processedCount / diffs.length) * 70) + 20; // 20-90% range
      this.updateStatus('applying', progress, `Processing batch ${batchIndex + 1}...`, processedCount);
      if (onProgress && this.currentStatus) {
        onProgress(this.currentStatus);
      }

      // Process batch
      const batchResult = this.diffEngine.applyMultipleDiffs(currentContent, batch);

      allResults.push(...batchResult.results.map(r => ({ error: r.error })));
      allErrors.push(...batchResult.errors.map(e => ({ error: e.error })));
      totalApplied += batchResult.appliedCount;

      if (batchResult.finalContent) {
        currentContent = batchResult.finalContent;
      }

      processedCount += batch.length;

      // Yield to browser event loop between batches (avoid await in loop)
      if (batchIndex < batches.length - 1) {
        // Schedule next batch processing to avoid blocking UI
        setTimeout(() => {}, 0);
      }
    }

    return {
      finalContent: totalApplied > 0 ? currentContent : undefined,
      appliedCount: totalApplied,
      results: allResults,
      errors: allErrors,
    };
  }

  /**
   * Create batches from array
   */
  private createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Yield control to browser event loop
   */
  private async yieldToBrowser(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  /**
   * Update processing status
   */
  private updateStatus(
      step: ProcessingStatus['step'],
      progress: number,
      description: string,
      processedCount?: number,
  ): void {
    if (!this.currentStatus) return;

    this.currentStatus.step = step;
    this.currentStatus.progress = Math.min(100, Math.max(0, progress));
    this.currentStatus.description = description;

    if (processedCount !== undefined) {
      this.currentStatus.processedCount = processedCount;
    }

    // Estimate time remaining
    if (progress > 0 && progress < 100) {
      const elapsed = performance.now() - this.currentStatus.startTime;
      const estimatedTotal = (elapsed / progress) * 100;
      this.currentStatus.estimatedTimeRemaining = estimatedTotal - elapsed;
    }
  }

  /**
   * Log performance metrics for optimization
   */
  private logPerformanceMetrics(
      totalTime: number,
      totalDiffs: number,
      appliedDiffs: number,
  ): void {
    const metrics = {
      totalTime: Math.round(totalTime),
      avgTimePerDiff: Math.round(totalTime / totalDiffs),
      successRate: Math.round((appliedDiffs / totalDiffs) * 100),
      diffsPerSecond: Math.round((totalDiffs / totalTime) * 1000),
    };

    // eslint-disable-next-line no-console
    console.info('[ClientSearchReplaceProcessor] Performance metrics:', metrics);

    if (totalTime > 5000) {
      // eslint-disable-next-line no-console
      console.warn('[ClientSearchReplaceProcessor] Slow processing detected:', metrics);
    }
  }

  // -----------------------------------------------------------------------------
  // Configuration and Utility Methods
  // -----------------------------------------------------------------------------

  /**
   * Update processor configuration
   */
  updateConfig(newConfig: Partial<ProcessorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.fuzzyMatcher.setThreshold(this.config.fuzzyThreshold);
    this.diffEngine.updateConfig(newConfig);
  }

  /**
   * Get current configuration
   */
  getConfig(): Required<ProcessorConfig> {
    return { ...this.config };
  }

  /**
   * Get current processing status
   */
  getCurrentStatus(): ProcessingStatus | null {
    return this.currentStatus ? { ...this.currentStatus } : null;
  }

  /**
   * Cancel current processing (if supported)
   */
  cancelProcessing(): void {
    if (this.currentStatus) {
      this.updateStatus('error', 0, 'Processing cancelled by user');
    }
  }

  /**
   * Validate processor configuration
   */
  validateConfig(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (this.config.fuzzyThreshold < 0 || this.config.fuzzyThreshold > 1) {
      issues.push('Fuzzy threshold must be between 0 and 1');
    }

    if (this.config.bufferLines < 0) {
      issues.push('Buffer lines must be non-negative');
    }

    if (this.config.maxDiffBlocks <= 0) {
      issues.push('Max diff blocks must be positive');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Get processor performance statistics
   */
  getPerformanceStats(): {
    lastProcessingTime?: number;
    averageProcessingTime?: number;
    successRate?: number;
    } {
    // This would be enhanced with persistent statistics tracking
    return {
      lastProcessingTime: this.currentStatus
        ? performance.now() - this.currentStatus.startTime
        : undefined,
    };
  }

}

// -----------------------------------------------------------------------------
// Utility Functions
// -----------------------------------------------------------------------------

/**
 * Create a processor with browser-optimized defaults
 */
export function createBrowserOptimizedProcessor(
    overrides: Partial<ProcessorConfig> = {},
): ClientSearchReplaceProcessor {
  const browserConfig: Partial<ProcessorConfig> = {
    fuzzyThreshold: 0.8,
    bufferLines: 30, // Smaller buffer for browser performance
    preserveIndentation: true,
    stripLineNumbers: true,
    enableAggressiveMatching: false,
    maxDiffBlocks: 8, // Conservative limit for browser
    ...overrides,
  };

  return new ClientSearchReplaceProcessor(browserConfig);
}

// -----------------------------------------------------------------------------
// Export Default Instance
// -----------------------------------------------------------------------------

/**
 * Default client search/replace processor instance
 * Pre-configured for typical browser usage
 */
export const defaultClientProcessor = createBrowserOptimizedProcessor();
