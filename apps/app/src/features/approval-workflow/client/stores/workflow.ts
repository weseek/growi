import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '~/client/util/apiv3-client';
import { useStaticSWR } from '~/stores/use-static-swr';

import { IWorkflowHasId, IWorkflowPaginateResult } from '../../interfaces/workflow';

export type WorkflowModalStatus = {
  pageId?: string,
  isOpened: boolean,
}

type WorkflowModalUtils = {
  open(pageId: string): void,
  close(): void,
}

export const useWorkflowModal = (): SWRResponse<WorkflowModalStatus, Error> & WorkflowModalUtils => {

  const initialStatus: WorkflowModalStatus = { isOpened: false };
  const swrResponse = useStaticSWR<WorkflowModalStatus, Error>('workflowModal', undefined, { fallbackData: initialStatus });

  return Object.assign(swrResponse, {
    open: (pageId: string) => {
      swrResponse.mutate({ isOpened: true, pageId });
    },
    close: () => {
      swrResponse.mutate({ isOpened: false });
    },
  });
};

export const useSWRxWorkflow = (workflowId?: string): SWRResponse<IWorkflowHasId, Error> => {
  const key = workflowId != null ? `/workflow/${workflowId}` : null;

  return useSWR(
    key,
    endpoint => apiv3Get(endpoint).then(result => result.data.workflow),
  );
};

// TODO: https://redmine.weseek.co.jp/issues/131035
export const useSWRxWorkflowList = (pageId?: string, limit?: number, offset?: number): SWRResponse<IWorkflowPaginateResult, Error> => {
  const key = pageId != null ? [`/workflow/list/${pageId}`, limit, offset] : null;

  return useSWR(
    key,
    ([endpoint, limit, offset]) => apiv3Get(endpoint as string, { limit, offset }).then(result => result.data.paginateResult),
  );
};
