import {
  type Nullable, type ICommentHasIdList, type IInlineCommentHasId, isInlineComment,
} from '@growi/core';
import { useSWRStatic } from '@growi/core/dist/swr';
import useSWR, { type SWRResponse } from 'swr';

import { apiGet } from '~/client/util/apiv1-client';
import { useCurrentPageId } from '~/stores/page';

type IResponseComment = {
  comments: ICommentHasIdList,
  ok: boolean,
}

export const useSWRxPageComment = (pageId: Nullable<string>): SWRResponse<ICommentHasIdList, Error> => {
  const shouldFetch: boolean = pageId != null;

  return useSWR(
    shouldFetch ? ['/comments.get', pageId] : null,
    ([endpoint, pageId]) => apiGet(endpoint, { page_id: pageId }).then((response:IResponseComment) => response.comments),
    { keepPreviousData: true },
  );
};

export const useSWRxInlineComment = (): SWRResponse<IInlineCommentHasId[] | null, Error> => {
  const { data: currentPageId } = useCurrentPageId();

  const swrResponse = useSWRxPageComment(currentPageId);

  const shouldFetch: boolean = currentPageId != null && swrResponse.data != null;

  return useSWR(
    shouldFetch ? ['inlineComment', currentPageId] : null,
    () => {
      return swrResponse.data != null
        ? swrResponse.data.filter<IInlineCommentHasId>(isInlineComment)
        : null;
    },
  );
};

type EditingCommentsNumOperation = {
  increment(): Promise<number | undefined>,
  decrement(): Promise<number | undefined>,
}

export const useSWRxEditingCommentsNum = (): SWRResponse<number, Error> & EditingCommentsNumOperation => {
  const swrResponse = useSWRStatic<number, Error>('editingCommentsNum', undefined, { fallbackData: 0 });

  return {
    ...swrResponse,
    increment: () => swrResponse.mutate((swrResponse.data ?? 0) + 1),
    decrement: () => {
      const newValue = (swrResponse.data ?? 0) - 1;
      return swrResponse.mutate(Math.max(0, newValue));
    },
  };
};
