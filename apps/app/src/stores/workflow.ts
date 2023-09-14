import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get } from '~/client/util/apiv3-client';
import { IWorkflowPaginateResult } from '~/interfaces/workflow';


export const useSWRxWorkflowList = (pageId: string): SWRResponse<IWorkflowPaginateResult, Error> => {

  const key = `/workflow/list/${pageId}`;

  return useSWRImmutable(
    key,
    endpoint => apiv3Get<IWorkflowPaginateResult >(endpoint).then(result => result.data),
  );
};
