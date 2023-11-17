import { useCallback, useMemo } from 'react';

import {
  type SWRResponseWithUtils, withUtils,
} from '@growi/core/dist/swr';
import useSWR, { SWRResponse } from 'swr';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';

import { apiv3Get, apiv3Post, apiv3Put } from '~/client/util/apiv3-client';
import { useStaticSWR } from '~/stores/use-static-swr';

import type {
  IWorkflowHasId,
  IWorkflowPaginateResult,
  EditingApproverGroup,
  CreateWorkflowApproverGroupData,
  CreateApproverGroupData,
  UpdateApproverGroupData,
} from '../../interfaces/workflow';


type WorkflowModalStatus = {
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


type UpdateWorkflowData = {
  name?: string,
  comment?: string,
  createApproverGroupData?: CreateApproverGroupData[],
  updateApproverGroupData?: UpdateApproverGroupData[],
}

type UseSWRxWorkflowUtils = {
  update(updateData: UpdateWorkflowData): Promise<void>
};

export const useSWRxWorkflow = (workflowId?: string): SWRResponseWithUtils<UseSWRxWorkflowUtils, IWorkflowHasId, Error> => {
  const key = workflowId != null ? `/workflow/${workflowId}` : null;

  const swrResponse = useSWR(
    key,
    endpoint => apiv3Get(endpoint).then(result => result.data.workflow),
  );

  // utils
  const update = useCallback(async(updateData: UpdateWorkflowData) => {
    const response = await apiv3Put(`/workflow/${workflowId}`, {
      name: updateData.name,
      comment: updateData.comment,
      createApproverGroupData: updateData.createApproverGroupData,
      updateApproverGroupData: updateData.updateApproverGroupData,
    });
    swrResponse.mutate(response.data.updatedWorkflow);
  }, [swrResponse, workflowId]);

  return withUtils<UseSWRxWorkflowUtils, IWorkflowHasId, Error>(swrResponse, { update });
};


// TODO: https://redmine.weseek.co.jp/issues/131035
export const useSWRxWorkflowList = (pageId?: string, limit?: number, offset?: number): SWRResponse<IWorkflowPaginateResult, Error> => {
  const key = pageId != null ? [`/workflow/list/${pageId}`, limit, offset] : null;

  return useSWR(
    key,
    ([endpoint, limit, offset]) => apiv3Get(endpoint as string, { limit, offset }).then(result => result.data.paginateResult),
  );
};


// Convert EditingApproverGroup[] to CreateWorkflowApproverGroupData[]
const transformToRequestData = (approverGroups?: EditingApproverGroup[]): CreateWorkflowApproverGroupData[] | undefined => {
  if (approverGroups == null) {
    return;
  }

  const clonedApproverGroups = [...approverGroups];
  const transformedApproverGroups: CreateWorkflowApproverGroupData[] = [];

  clonedApproverGroups.forEach((group) => {
    const approvers = group.approvers.map((v) => { return { user: v.user._id } });
    const requestData = {
      approvalType: group.approvalType,
      approvers,
    };
    transformedApproverGroups.push(requestData);
  });

  return transformedApproverGroups;
};

export const useSWRMUTxCreateWorkflow = (
    pageId?: string,
    approverGroups?: EditingApproverGroup[],
    name?: string,
    comment?: string,
): SWRMutationResponse<IWorkflowHasId, Error> => {

  const transformedApproverGroup = useMemo(() => transformToRequestData(approverGroups), [approverGroups]);
  const key = pageId != null || transformedApproverGroup != null ? [pageId, transformedApproverGroup, name, comment] : null;

  return useSWRMutation(
    key,
    ([pageId, transformedApproverGroup, name, comment]) => apiv3Post('/workflow', {
      pageId, approverGroups: transformedApproverGroup, name, comment,
    }).then(result => result.data.createdWorkflow),
  );
};
