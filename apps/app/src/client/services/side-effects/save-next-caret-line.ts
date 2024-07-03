import { useCallback, useEffect } from 'react';

import type EventEmitter from 'events';

import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var globalEmitter: EventEmitter;
}

type SaveNextCaretLineUtils = {
  pick(): number | undefined,
}

export const useSaveNextCaretLine = (initialData?: number): SWRResponse<number> & SaveNextCaretLineUtils => {

  const swrResponse = useSWRStatic('saveNextCaretLine', initialData, { fallbackData: 0 });
  const { data, mutate } = swrResponse;

  const pick = useCallback(() => {
    const tmp = data;
    mutate(0);
    return tmp;
  }, [data, mutate]);

  useEffect(() => {
    const handler = (lineNumber: number) => {
      mutate(lineNumber);
    };

    globalEmitter.on('saveNextCaretLine', handler);

    return function cleanup() {
      globalEmitter.removeListener('saveNextCaretLine', handler);
    };
  }, [mutate]);

  return {
    ...swrResponse,
    pick,
  };
};
