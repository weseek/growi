import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiGet } from '~/client/util/apiv1-client';
import { IResTagsListApiv1, IResTagsSearchApiv1 } from '~/interfaces/tag';

export const useSWRxTagsList = (limit?: number, offset?: number): SWRResponse<IResTagsListApiv1, Error> => {
  return useSWRImmutable(
    ['/tags.list', limit, offset],
    ([endpoint, limit, offset]) => apiGet(endpoint, { limit, offset }).then((result: IResTagsListApiv1) => result),
  );
};

export const useSWRxTagsSearch = (query: string): SWRResponse<IResTagsSearchApiv1, Error> => {
  return useSWRImmutable(
    ['/tags.search', query],
    ([endpoint, query]) => apiGet(endpoint, { q: query }).then((result: IResTagsSearchApiv1) => result),
  );
};
