import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get } from '../client/util/apiv3-client';
import { IActivityHasId } from '../interfaces/activity';
import { PaginateResult } from '../interfaces/mongoose-utils';

type IQuery = {
  action?: string[]
}

export const useSWRxActivityList = (limit?: number, offset?: number, query?: IQuery): SWRResponse<PaginateResult<IActivityHasId>, Error> => {
  const stringifiedQuery = JSON.stringify(query);
  return useSWRImmutable(
    ['/activity', limit, offset, stringifiedQuery],
    (endpoint, limit, offset, stringifiedQuery) => apiv3Get(endpoint, { limit, offset, query: stringifiedQuery })
      .then(result => result.data.serializedPaginationResult),
  );
};
