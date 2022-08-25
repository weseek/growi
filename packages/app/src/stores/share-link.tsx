import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '~/client/util/apiv3-client';
import { IResShareLinkList } from '~/interfaces/share-link';

import { useCurrentPageId } from './context';


const fetchShareLinks = async(endpoint, pageId): Promise<IResShareLinkList['shareLinksResult']> => {
  const res = await apiv3Get<IResShareLinkList>(endpoint, { relatedPage: pageId });
  return res.data.shareLinksResult;
};

export const useSWRxSharelink = (): SWRResponse<IResShareLinkList['shareLinksResult'], Error> => {
  const { data: currentPageId } = useCurrentPageId();
  return useSWR('/share-links/', (endpoint => fetchShareLinks(endpoint, currentPageId)));
};
