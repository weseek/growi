import { IAttachmentHasId } from '@growi/core';
import axios from 'axios';
import useSWR, { SWRResponse } from 'swr';

export const useSWRxRef = (
    pagePath: string, fileNameOrId: string, isImmutable?: boolean,
): SWRResponse<IAttachmentHasId, Error> => {
  return useSWR(
    ['/_api/attachment-refs/ref', pagePath, fileNameOrId, isImmutable],
    ([endpoint, pagePath, fileNameOrId]) => {
      return axios.get(endpoint, {
        params: {
          pagePath,
          fileNameOrId,
        },
      }).then(result => result.data.attachment);
    },
    {
      keepPreviousData: true,
      revalidateIfStale: !isImmutable,
      revalidateOnFocus: !isImmutable,
      revalidateOnReconnect: !isImmutable,
    },
  );
};

export const useSWRxRefs = (
    prefix: string, pagePath: string, options?: Record<string, string | undefined>, isImmutable?: boolean,
): SWRResponse<IAttachmentHasId, Error> => {
  return useSWR(
    ['/_api/attachment-refs/refs', prefix, pagePath, options, isImmutable],
    ([endpoint, prefix, pagePath, options]) => {
      return axios.get(endpoint, {
        params: {
          prefix,
          pagePath,
          options,
        },
      }).then(result => result.data.attachments);
    },
    {
      keepPreviousData: true,
      revalidateIfStale: !isImmutable,
      revalidateOnFocus: !isImmutable,
      revalidateOnReconnect: !isImmutable,
    },
  );
};
