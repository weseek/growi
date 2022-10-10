import { useCallback } from 'react';

import {
  HasObjectId,
  IAttachment, Nullable, SWRResponseWithUtils, withUtils,
} from '@growi/core';
import useSWR, { SWRResponse } from 'swr';

import { apiPost } from '~/client/util/apiv1-client';
import { apiv3Get } from '~/client/util/apiv3-client';
import { IResAttachmentList } from '~/interfaces/attachment';

import { PluginResult } from '../models/SearchResult';

// TODO: Correct types
const pluginsFetcher = () => {
  return async() => {
    const reqUrl = '/plugins-extension';
    try {
      const data = await apiv3Get(reqUrl);
      return data;
    }
    catch (err) {
      // TODO: Error handling
      console.log('err', err);
    }
  };
};

export const useSWRxPlugins = (): SWRResponse<any | null, Error> => {
  return useSWR('/extension', pluginsFetcher());
};


// export const useSWRxPlugins = (): SWRResponseWithUtils<Util, IDataAttachmentList, Error> => {
//   const shouldFetch = pageId != null && pageNumber != null;

//   const fetcher = useCallback(async(endpoint, pageId, pageNumber) => {
//     const res = await apiv3Get<IResAttachmentList>(endpoint, { pageId, pageNumber });
//     const resAttachmentList = res.data;
//     const { paginateResult } = resAttachmentList;
//     return {
//       attachments: paginateResult.docs,
//       totalAttachments: paginateResult.totalDocs,
//       limit: paginateResult.limit,
//     };
//   }, []);

//   const swrResponse = useSWR(
//     shouldFetch ? ['/attachment/list', pageId, pageNumber] : null,
//     fetcher,
//   );

//   // Utils
//   const remove = useCallback(async(body: { attachment_id: string }) => {
//     const { mutate } = swrResponse;

//     try {
//       await apiPost('/attachments.remove', body);
//       mutate();
//     }
//     catch (err) {
//       throw err;
//     }
//   }, [swrResponse]);

//   return withUtils<Util, IDataAttachmentList, Error>(swrResponse, { remove });
// };
