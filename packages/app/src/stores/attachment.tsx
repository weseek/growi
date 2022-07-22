import { useCallback } from 'react';

import {
  IAttachment, Nullable, SWRResponseWithUtils, withUtils,
} from '@growi/core';
import useSWR from 'swr';

import { apiGet, apiPost } from '~/client/util/apiv1-client';
import { IResAttachmentList } from '~/interfaces/attachment';

type Util = {
  remove(body: { attachment_id: string }): Promise<void>
};

type IDataAttachmentList = {
  attachments: IAttachment[]
  totalAttachments: number
  limit: number
};

export const useSWRxAttachments = (pageId?: Nullable<string>, pageNumber?: number): SWRResponseWithUtils<Util, IDataAttachmentList, Error> => {
  const shouldFetch = pageId != null && pageNumber != null;

  const fetcher = useCallback(async(endpoint) => {
    const res = await apiGet<IResAttachmentList>(endpoint, { pageId, pageNumber });
    return {
      attachments: res.data.paginateResult.docs,
      totalAttachments: res.data.paginateResult.totalDocs,
      limit: res.data.paginateResult.limit,
    };
  }, [pageId, pageNumber]);

  const swrResponse = useSWR(
    shouldFetch ? ['/attachments/list', pageId, pageNumber] : null,
    fetcher,
  );

  // Utils
  const remove = useCallback(async(body: { attachment_id: string }) => {
    const { mutate } = swrResponse;

    try {
      await apiPost('/attachments.remove', body);
      mutate();
    }
    catch (err) {
      throw err;
    }
  }, [swrResponse]);

  return withUtils<Util, IDataAttachmentList, Error>(swrResponse, { remove });
};
