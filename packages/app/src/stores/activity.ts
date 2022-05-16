import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get } from '../client/util/apiv3-client';
import { IActivityHasId, SupportedActionType } from '../interfaces/activity';
import { PaginateResult } from '../interfaces/mongoose-utils';


type ISearchFilter = {
  date?: {startDate: string | null, endDate: string | null}
  action?: SupportedActionType[]
}

export const useSWRxActivityList = (limit?: number, offset?: number, searchFilter?: ISearchFilter): SWRResponse<PaginateResult<IActivityHasId>, Error> => {
  const stringifiedSearchFilter = JSON.stringify(searchFilter);
  return useSWRImmutable(
    ['/activity', limit, offset, stringifiedSearchFilter],
    (endpoint, limit, offset, stringifiedSearchFilter) => apiv3Get(endpoint, { limit, offset, searchFilter: stringifiedSearchFilter })
      .then(result => result.data.serializedPaginationResult),
  );
};
