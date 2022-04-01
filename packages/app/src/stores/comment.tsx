import useSWR, { SWRResponse } from 'swr';

import { apiGet } from '~/client/util/apiv1-client';

import { ICommentHasIdList } from '../interfaces/comment';
import { Nullable } from '../interfaces/common';

type IResponseComment = {
  comments: ICommentHasIdList,
  ok: boolean,
}

export const useSWRxPageComment = (pageId: Nullable<string>): SWRResponse<ICommentHasIdList, Error> => {
  const shouldFetch: boolean = pageId != null;
  return useSWR(
    shouldFetch ? ['/comments.get', pageId] : null,
    (endpoint, pageId) => apiGet(endpoint, { page_id: pageId }).then((response:IResponseComment) => response.comments),
  );
};
