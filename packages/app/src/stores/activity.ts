import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get } from '../client/util/apiv3-client';
import { IActivityHasId } from '../interfaces/activity';
import { PaginateResult } from '../interfaces/mongoose-utils';

export const useSWRxActivityList = (limit?: number, offset?: number): SWRResponse<PaginateResult<IActivityHasId>, Error> => {
  return useSWRImmutable(
    ['/activity', limit, offset],
    (endpoint, limit, offset) => apiv3Get(endpoint, { limit, offset }).then(result => result.data.serializedPaginationResult),
  );
};
