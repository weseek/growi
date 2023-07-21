import type { Nullable } from '@growi/core/dist/interfaces';
import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '~/client/util/apiv3-client';
import { IResShareLinkList } from '~/interfaces/share-link';

const fetchShareLinks = async(endpoint, pageId) => {
  const res = await apiv3Get<IResShareLinkList>(endpoint, { relatedPage: pageId });
  return res.data.shareLinksResult;
};

export const useSWRxSharelink = (currentPageId: Nullable<string>): SWRResponse<IResShareLinkList['shareLinksResult'], Error> => {
  return useSWR(
    currentPageId == null ? null : ['/share-links/', currentPageId],
    ([endpoint]) => fetchShareLinks(endpoint, currentPageId),
  );
};
