import { useCallback, useEffect, useState } from 'react';

import { useSecondaryYdocs } from '@growi/editor/dist/client/stores/use-secondary-ydocs';

import {
  SseMessageSchema,
  SseDetectedDiffSchema,
  SseFinalizedSchema,
  isInsertDiff,
  isDeleteDiff,
  isRetainDiff,
  type SseMessage,
  type SseDetectedDiff,
  type SseFinalized,
} from '~/features/openai/interfaces/editor-assistant/sse-schemas';
import { handleIfSuccessfullyParsed } from '~/features/openai/utils/handle-if-successfully-parsed';
import { useIsEnableUnifiedMergeView } from '~/stores-universal/context';
import { useCurrentPageId } from '~/stores/page';

interface PostMessage {
  (threadId: string, userMessage: string, markdown: string): Promise<Response>;
}
interface ProcessMessage {
  (data: unknown, handler: {
    onMessage: (data: SseMessage) => void;
    onDetectedDiff: (data: SseDetectedDiff) => void;
    onFinalized: (data: SseFinalized) => void;
  }): void;
}

type DetectedDiff = Array<{
  data: SseDetectedDiff,
  applied: boolean,
  id: string,
}>

export const useEditorAssistant = (): { postMessage: PostMessage, processMessage: ProcessMessage } => {
  const [detectedDiff, setDetectedDiff] = useState<DetectedDiff>();

  const { data: currentPageId } = useCurrentPageId();
  const { data: isEnableUnifiedMergeView, mutate: mutateIsEnableUnifiedMergeView } = useIsEnableUnifiedMergeView();
  const ydocs = useSecondaryYdocs(isEnableUnifiedMergeView ?? false, { pageId: currentPageId ?? undefined, useSecondary: isEnableUnifiedMergeView ?? false });

  const postMessage: PostMessage = useCallback(async(threadId, userMessage, markdown) => {
    const response = await fetch('/_api/v3/openai/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        threadId,
        userMessage,
        markdown,
      }),
    });
    return response;
  }, []);

  const processMessage: ProcessMessage = useCallback((data, handler) => {
    handleIfSuccessfullyParsed(data, SseMessageSchema, (data: SseMessage) => {
      handler.onMessage(data);
    });
    handleIfSuccessfullyParsed(data, SseDetectedDiffSchema, (data: SseDetectedDiff) => {
      setDetectedDiff((prev) => {
        mutateIsEnableUnifiedMergeView(true);
        const newData = { data, applied: false, id: crypto.randomUUID() };
        if (prev == null) {
          return [newData];
        }
        return [...prev, newData];
      });
      handler.onDetectedDiff(data);
    });
    handleIfSuccessfullyParsed(data, SseFinalizedSchema, (data: SseFinalized) => {
      handler.onFinalized(data);
    });
  }, [mutateIsEnableUnifiedMergeView]);

  useEffect(() => {
    const pendingDetectedDiff: DetectedDiff | undefined = detectedDiff?.filter(diff => diff.applied === false);
    if (ydocs?.secondaryDoc != null && pendingDetectedDiff != null && pendingDetectedDiff.length > 0) {

      // Apply detectedDiffs to secondaryDoc
      const ytext = ydocs.secondaryDoc.getText('codemirror');
      pendingDetectedDiff.forEach((detectedDiff) => {
        if (isInsertDiff(detectedDiff.data)) {
          ytext.insert(0, detectedDiff.data.diff.insert);
        }
        if (isDeleteDiff(detectedDiff.data)) {
          // TODO: https://redmine.weseek.co.jp/issues/163945
        }
        if (isRetainDiff(detectedDiff.data)) {
          // TODO: https://redmine.weseek.co.jp/issues/163945
        }
      });

      // Mark as applied: true after applying to secondaryDoc
      setDetectedDiff((prev) => {
        const pendingDetectedDiffIds = pendingDetectedDiff.map(diff => diff.id);
        prev?.forEach((diff) => {
          if (pendingDetectedDiffIds.includes(diff.id)) {
            diff.applied = true;
          }
        });
        return prev;
      });

      // Set detectedDiff to undefined after applying all detectedDiff to secondaryDoc
      if (detectedDiff?.filter(detectedDiff => detectedDiff.applied === false).length === 0) {
        setDetectedDiff(undefined);
      }
    }
  }, [detectedDiff, ydocs?.secondaryDoc]);

  return {
    postMessage,
    processMessage,
  };
};
