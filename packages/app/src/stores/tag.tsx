import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiGet } from '~/client/util/apiv1-client';
import { ITagsListApiv1Result } from '~/interfaces/tag';

export const useSWRxTagsList = (limit?: number, offset?: number): SWRResponse<ITagsListApiv1Result, Error> => {
  return useSWRImmutable(
    ['/tags.list', limit, offset],
    (endpoint, limit, offset) => apiGet(endpoint, { limit, offset }).then((result: ITagsListApiv1Result) => result),
  );
};
