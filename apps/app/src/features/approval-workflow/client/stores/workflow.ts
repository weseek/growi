import { SWRResponse, useSWRImmutable } from 'swr';

import { apiv3Get } from '~/client/util/apiv3-client';
import { useStaticSWR } from '~/stores/use-static-swr';

import { IWorkflowPaginateResult } from '../../interfaces/workflow';

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


export const useSWRxWorkflowList = (pageId: string): SWRResponse<IWorkflowPaginateResult, Error> => {

  const key = `/workflow/list/${pageId}`;

  return useSWRImmutable(
    key,
    endpoint => apiv3Get<IWorkflowPaginateResult >(endpoint).then(result => result.data),
  );
};
