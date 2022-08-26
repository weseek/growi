import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '~/client/util/apiv3-client';
import { Nullable } from '~/interfaces/common';
import { IResShareLinkList } from '~/interfaces/share-link';

const fetchShareLinks = async(endpoint, pageId) => {
  const res = await apiv3Get<IResShareLinkList>(endpoint, { relatedPage: pageId });
  return res.data.shareLinksResult;
};

export const useSWRxSharelink = (currentPageId: Nullable<string>): SWRResponse<IResShareLinkList['shareLinksResult'], Error> => {
  return useSWR(['/share-links/', currentPageId], ((endpoint) => {
    if (currentPageId == null) {
      return [];
    }
    return fetchShareLinks(endpoint, currentPageId);
  }));
};
