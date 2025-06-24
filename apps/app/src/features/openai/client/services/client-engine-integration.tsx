/**
 * Client Engine Integration for useEditorAssistant Hook
 * Provides seamless integration between existing SSE processing and new client-side engine
 */

import {
  useCallback, useRef, useState, useMemo,
} from 'react';

import type { Text as YText } from 'yjs';

import type { LlmEditorAssistantDiff } from '../../interfaces/editor-assistant/llm-response-schemas';
import type { SseDetectedDiff } from '../../interfaces/editor-assistant/sse-schemas';
import type { ProcessingResult } from '../../interfaces/editor-assistant/types';

import { ClientSearchReplaceProcessor } from './editor-assistant/processor';

// -----------------------------------------------------------------------------
// Integration Configuration
// -----------------------------------------------------------------------------

export interface ClientEngineConfig {
  /** Enable client-side processing */
  enableClientProcessing: boolean;
  /** Fallback to server processing on client errors */
  enableServerFallback: boolean;
  /** Log performance metrics for comparison */
  enablePerformanceMetrics: boolean;
  /** Maximum processing time before timeout (ms) */
  maxProcessingTime: number;
  /** Batch size for diff processing */
  batchSize: number;
}

export interface ProcessingMetrics {
  /** Processing method used */
  method: 'client' | 'server' | 'hybrid';
  /** Total processing time in milliseconds */
  processingTime: number;
  /** Number of diffs processed */
  diffsCount: number;
  /** Number of diffs successfully applied */
  appliedCount: number;
  /** Success rate as percentage */
  successRate: number;
  /** Error information if any */
  error?: string;
  /** Memory usage (if available) */
  memoryUsage?: number;
}

export interface ProcessingProgress {
  current: number;
  total: number;
  message: string;
  percentage: number;
}

// -----------------------------------------------------------------------------
// Client Engine Integration Hook
// -----------------------------------------------------------------------------

export function useClientEngineIntegration(config: Partial<ClientEngineConfig> = {}): {
  processDetectedDiffsClient: (
    content: string,
    detectedDiffs: SseDetectedDiff[],
  ) => Promise<ProcessingResult>;
  applyToYText: (yText: YText, processedContent: string) => boolean;
  processHybrid: (
    content: string,
    detectedDiffs: SseDetectedDiff[],
    serverProcessingFn: () => Promise<void>,
  ) => Promise<{ success: boolean; method: 'client' | 'server'; result?: ProcessingResult }>;
  isClientProcessing: boolean;
  lastProcessingMethod: 'client' | 'server' | 'hybrid';
  processingMetrics: ProcessingMetrics[];
  getPerformanceComparison: () => {
    clientAvgTime: number;
    serverAvgTime: number;
    timeImprovement: number;
    clientSuccessRate: number;
    serverSuccessRate: number;
    totalClientProcessing: number;
    totalServerProcessing: number;
  } | null;
  resetMetrics: () => void;
  config: ClientEngineConfig;
  isClientProcessingEnabled: boolean;
} {
  // Configuration with defaults
  const finalConfig: ClientEngineConfig = useMemo(() => ({
    enableClientProcessing: true,
    enableServerFallback: true,
    enablePerformanceMetrics: true,
    maxProcessingTime: 10000,
    batchSize: 5,
    ...config,
  }), [config]);

  // State
  const [isClientProcessing, setIsClientProcessing] = useState(false);
  const [processingMetrics, setProcessingMetrics] = useState<ProcessingMetrics[]>([]);
  const [lastProcessingMethod, setLastProcessingMethod] = useState<'client' | 'server' | 'hybrid'>('server');

  // Client processor instance
  const clientProcessor = useRef<ClientSearchReplaceProcessor>();

  // Initialize client processor
  if (!clientProcessor.current && finalConfig.enableClientProcessing) {
    clientProcessor.current = new ClientSearchReplaceProcessor({
      fuzzyThreshold: 0.8,
      bufferLines: 30,
      maxDiffBlocks: 8,
    });
  }

  /**
   * Process detected diffs using client-side engine
   */
  const processDetectedDiffsClient = useCallback(async(
      content: string,
      detectedDiffs: SseDetectedDiff[],
  ): Promise<ProcessingResult> => {
    if (!clientProcessor.current) {
      throw new Error('Client processor not initialized');
    }

    const startTime = performance.now();
    setIsClientProcessing(true);

    try {
      // Convert SseDetectedDiff to LlmEditorAssistantDiff format
      const diffs: LlmEditorAssistantDiff[] = detectedDiffs
        .map(d => d.diff)
        .filter((diff): diff is LlmEditorAssistantDiff => diff != null);

      // Validate required fields for client processing
      for (const diff of diffs) {
        if (!diff.startLine) {
          throw new Error(
            `startLine is required for client processing but missing in diff: ${diff.search?.substring(0, 50)}...`,
          );
        }
        if (!diff.search) {
          throw new Error(
            `search field is required for client processing but missing in diff at line ${diff.startLine}`,
          );
        }
      }

      // Process with client engine
      const diffResult = await clientProcessor.current.processMultipleDiffs(content, diffs, {
        enableProgressCallbacks: true,
        batchSize: finalConfig.batchSize,
        maxProcessingTime: finalConfig.maxProcessingTime,
      });

      // Convert DiffApplicationResult to ProcessingResult
      const processingTime = performance.now() - startTime;
      const result: ProcessingResult = {
        success: diffResult.success,
        error: diffResult.failedParts?.[0],
        matches: [], // Client engine doesn't expose individual matches
        appliedCount: diffResult.appliedCount,
        skippedCount: Math.max(0, diffs.length - diffResult.appliedCount),
        modifiedText: diffResult.content || content,
        originalText: content,
        processingTime,
      };

      // Record metrics
      const metrics: ProcessingMetrics = {
        method: 'client',
        processingTime,
        diffsCount: diffs.length,
        appliedCount: result.appliedCount,
        successRate: diffs.length > 0 ? (result.appliedCount / diffs.length) * 100 : 100,
        error: result.success ? undefined : result.error?.message,
      };

      if (finalConfig.enablePerformanceMetrics) {
        setProcessingMetrics(prev => [...prev, metrics]);
      }

      setLastProcessingMethod('client');
      return result;
    }
    finally {
      setIsClientProcessing(false);
    }
  }, [finalConfig]);

  /**
   * Apply processed content to YText (CodeMirror integration)
   */
  const applyToYText = useCallback((
      yText: YText,
      processedContent: string,
  ): boolean => {
    try {
      const currentContent = yText.toString();

      if (currentContent === processedContent) {
        // No changes needed
        return true;
      }

      // Apply changes in a transaction
      yText.doc?.transact(() => {
        // Clear existing content
        yText.delete(0, yText.length);
        // Insert new content
        yText.insert(0, processedContent);
      });

      return true;
    }
    catch (error) {
      return false;
    }
  }, []);

  /**
   * Hybrid processing: try client first, fallback to server
   */
  const processHybrid = useCallback(async(
      content: string,
      detectedDiffs: SseDetectedDiff[],
      serverProcessingFn: () => Promise<void>,
  ): Promise<{ success: boolean; method: 'client' | 'server'; result?: ProcessingResult }> => {
    if (!finalConfig.enableClientProcessing) {
      // Client processing disabled, use server only
      await serverProcessingFn();
      setLastProcessingMethod('server');
      return { success: true, method: 'server' };
    }

    try {
      // Try client processing first
      const result = await processDetectedDiffsClient(content, detectedDiffs);

      if (result.success) {
        setLastProcessingMethod('client');
        return { success: true, method: 'client', result };
      }

      // Client processing failed, fallback to server if enabled
      if (finalConfig.enableServerFallback) {
        await serverProcessingFn();
        setLastProcessingMethod('server');
        return { success: true, method: 'server' };
      }

      // No fallback, return client error
      return { success: false, method: 'client', result };
    }
    catch (error) {
      // Fallback to server on error
      if (finalConfig.enableServerFallback) {
        await serverProcessingFn();
        setLastProcessingMethod('server');
        return { success: true, method: 'server' };
      }

      return { success: false, method: 'client' };
    }
  }, [finalConfig, processDetectedDiffsClient]);

  /**
   * Get performance comparison between client and server processing
   */
  const getPerformanceComparison = useCallback(() => {
    const clientMetrics = processingMetrics.filter(m => m.method === 'client');
    const serverMetrics = processingMetrics.filter(m => m.method === 'server');

    if (clientMetrics.length === 0 || serverMetrics.length === 0) {
      return null;
    }

    const avgClientTime = clientMetrics.reduce((sum, m) => sum + m.processingTime, 0) / clientMetrics.length;
    const avgServerTime = serverMetrics.reduce((sum, m) => sum + m.processingTime, 0) / serverMetrics.length;
    const avgClientSuccess = clientMetrics.reduce((sum, m) => sum + m.successRate, 0) / clientMetrics.length;
    const avgServerSuccess = serverMetrics.reduce((sum, m) => sum + m.successRate, 0) / serverMetrics.length;

    return {
      clientAvgTime: avgClientTime,
      serverAvgTime: avgServerTime,
      timeImprovement: ((avgServerTime - avgClientTime) / avgServerTime) * 100,
      clientSuccessRate: avgClientSuccess,
      serverSuccessRate: avgServerSuccess,
      totalClientProcessing: clientMetrics.length,
      totalServerProcessing: serverMetrics.length,
    };
  }, [processingMetrics]);

  /**
   * Reset metrics for new comparison
   */
  const resetMetrics = useCallback(() => {
    setProcessingMetrics([]);
  }, []);

  return {
    // Processing functions
    processDetectedDiffsClient,
    applyToYText,
    processHybrid,

    // State
    isClientProcessing,
    lastProcessingMethod,
    processingMetrics,

    // Metrics and comparison
    getPerformanceComparison,
    resetMetrics,

    // Configuration
    config: finalConfig,
    isClientProcessingEnabled: finalConfig.enableClientProcessing,
  };
}

// -----------------------------------------------------------------------------
// Utility Functions
// -----------------------------------------------------------------------------

/**
 * Convert SseDetectedDiff to content string for processing
 */
export function extractContentFromDetectedDiffs(detectedDiffs: SseDetectedDiff[]): string {
  // This would need to be implemented based on how the current system
  // extracts content from detected diffs
  return detectedDiffs
    .map(d => d.diff?.search || '')
    .filter(Boolean)
    .join('\n');
}

/**
 * Feature flag for enabling client processing
 */
export function shouldUseClientProcessing(): boolean {
  // This could be controlled by environment variables, user settings, etc.
  return (process.env.NODE_ENV === 'development')
    || (typeof window !== 'undefined'
        && (window as { __GROWI_CLIENT_PROCESSING_ENABLED__?: boolean }).__GROWI_CLIENT_PROCESSING_ENABLED__ === true);
}

export default useClientEngineIntegration;
