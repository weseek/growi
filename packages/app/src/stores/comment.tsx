import useSWR, { SWRResponse } from 'swr';

import { apiGet } from '~/client/util/apiv1-client';

import { ICommentHasIdList } from '../interfaces/comment';
import { Nullable } from '../interfaces/common';

type IResponseComment = {
  comments: ICommentHasIdList,
  ok: string,
}

export const useSWRxPageComment = (pageId: Nullable<string>): SWRResponse<ICommentHasIdList, Error> => {
  return useSWR(
    pageId != null ? '/comments.get' : null,
    endpoint => apiGet(endpoint, { page_id: pageId }).then((response:IResponseComment) => response.comments),
  );
};
