import {
  useState, useEffect, useCallback,
} from 'react';

import { useSWRStatic } from '@growi/core/dist/swr';
import { useRouter } from 'next/router';
import type { SWRResponse } from 'swr';

import { useYjsMaxBodyLength } from '~/stores-universal/context';
import { EditorMode, useEditorMode } from '~/stores-universal/ui';
import { useSWRxCurrentPage } from '~/stores/page';

export const useIsYjsEnabled = (): SWRResponse<boolean, Error> => {
  const { data: yjsMaxBodyLength } = useYjsMaxBodyLength();
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: editorMode } = useEditorMode();

  const [shouldRecalculate, setShouldRecalculate] = useState<boolean>(false);

  const swrResponse = useSWRStatic<boolean, Error>('isYjsEnabled', undefined);

  const router = useRouter();

  const onRouterChangeComplete = useCallback(() => {
    setShouldRecalculate(false);
    swrResponse.mutate(undefined);
  }, [swrResponse]);

  useEffect(() => {
    router.events.on('routeChangeComplete', onRouterChangeComplete);
    return () => {
      router.events.off('routeChangeComplete', onRouterChangeComplete);
    };
  }, [onRouterChangeComplete, router.events]);

  useEffect(() => {
    if (editorMode === EditorMode.Editor) {
      setShouldRecalculate(true);
    }
    else {
      setShouldRecalculate(false);
      swrResponse.mutate(undefined);
    }
  }, [editorMode]);

  useEffect(() => {
    if (shouldRecalculate && currentPage?.revision?.body != null && yjsMaxBodyLength != null) {
      setShouldRecalculate(false);
      swrResponse.mutate(currentPage.revision.body.length <= yjsMaxBodyLength);
    }
  }, [currentPage?.revision?.body, shouldRecalculate, yjsMaxBodyLength]);

  return swrResponse;
};
