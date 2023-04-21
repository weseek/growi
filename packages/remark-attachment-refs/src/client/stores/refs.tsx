import * as url from 'url';

import { IAttachmentHasId, pathUtils } from '@growi/core';
import axios from 'axios';
import useSWR, { SWRResponse } from 'swr';

/**
   * return absolute path for the specified path
   *
   * @param {string} relativePath relative path from fromPagePath`
   */
function getAbsolutePathFor(relativePath: string): string {
  return decodeURIComponent(
    pathUtils.normalizePath( // normalize like /foo/bar
      url.resolve(pathUtils.addTrailingSlash(this.fromPagePath), relativePath),
    ),
  );
}

export const useSWRxRef = (
    pagePath: string, fileNameOrId: string, isImmutable?: boolean,
): SWRResponse<IAttachmentHasId, Error> => {
  return useSWR(
    ['/_api/ref', pagePath, fileNameOrId, isImmutable],
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
    ['/_api/refs', prefix, pagePath, options, isImmutable],
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
