import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get } from '../client/util/apiv3-client';
import { IActivityHasId, ISearchFilter, SupportedActionType } from '../interfaces/activity';
import { PaginateResult } from '../interfaces/mongoose-utils';

export const useSWRxActivity = (limit?: number, offset?: number, searchFilter?: ISearchFilter): SWRResponse<PaginateResult<IActivityHasId>, Error> => {
  const stringifiedSearchFilter = JSON.stringify(searchFilter);
  return useSWRImmutable(
    ['/activity', limit, offset, stringifiedSearchFilter],
    (endpoint, limit, offset, stringifiedSearchFilter) => apiv3Get(endpoint, { limit, offset, searchFilter: stringifiedSearchFilter })
      .then(result => result.data.paginationResult),
  );
};

export const useSWRxSearchableActions = (): SWRResponse<SupportedActionType[], Error> => {
  return useSWRImmutable(
    ['/activity/searchable-actions'],
    endpoint => apiv3Get(endpoint).then(result => result.data.searchableActions),
  );
};
