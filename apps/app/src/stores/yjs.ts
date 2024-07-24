import { useCallback, useMemo } from 'react';

import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';

import { apiv3Get } from '~/client/util/apiv3-client';
import type { CurrentPageYjsData } from '~/interfaces/yjs';
import { useYjsMaxBodyLength } from '~/stores-universal/context';
import { EditorMode, useEditorMode } from '~/stores-universal/ui';
import { useSWRxCurrentPage, useCurrentPageId } from '~/stores/page';


type CurrentPageYjsDataUtils = {
  updateHasYdocsNewerThanLatestRevision(hasYdocsNewerThanLatestRevision: boolean): void
  updateAwarenessStateSize(awarenessStateSize: number): void
}

export const useCurrentPageYjsData = (): SWRResponse<CurrentPageYjsData, Error> & CurrentPageYjsDataUtils => {
  const { data: currentPageId } = useCurrentPageId();

  const key = currentPageId != null
    ? `/page/${currentPageId}/yjs-data`
    : null;

  const swrResponse = useSWRStatic<CurrentPageYjsData, Error>(key, undefined);

  const updateHasYdocsNewerThanLatestRevision = useCallback((hasYdocsNewerThanLatestRevision: boolean) => {
    swrResponse.mutate({ ...swrResponse.data, hasYdocsNewerThanLatestRevision });
  }, [swrResponse]);

  const updateAwarenessStateSize = useCallback((awarenessStateSize: number) => {
    swrResponse.mutate({ ...swrResponse.data, awarenessStateSize });
  }, [swrResponse]);

  return Object.assign(swrResponse, { updateHasYdocsNewerThanLatestRevision, updateAwarenessStateSize });
};

export const useSWRMUTxCurrentPageYjsData = (): SWRMutationResponse<CurrentPageYjsData, Error> => {
  const { data: currentPageId } = useCurrentPageId();

  const key = currentPageId != null
    ? `/page/${currentPageId}/yjs-data`
    : null;

  return useSWRMutation(
    key,
    ([endpoint]) => apiv3Get<{ yjsData: CurrentPageYjsData }>(endpoint).then(result => result.data.yjsData),
    { populateCache: true, revalidate: false },
  );
};


export const useIsYjsEnabled = (): SWRResponse<boolean, Error> => {
  const { data: yjsMaxBodyLength } = useYjsMaxBodyLength();
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: editorMode } = useEditorMode();

  // Recalculated at the time the editor is switched
  const isYjsEnabled = useMemo(() => (
    editorMode === EditorMode.Editor && (currentPage?.revision?.body.length ?? 0) <= (yjsMaxBodyLength ?? 0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [editorMode]);

  return useSWRImmutable('isYjsEnabled', () => isYjsEnabled, { fallbackData: isYjsEnabled });
};
