import type { IUserHasId } from '@growi/core';

import type { PaginateResult } from '~/interfaces/mongoose-utils';


export const WorkflowStatus = {
  INPROGRESS: 'INPROGRESS',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  CANCEL: 'CANCEL',
} as const;

export const WorkflowApproverStatus = {
  NONE: 'NONE',
  APPROVE: 'APPROVE',
  REMAND: 'REMAND',
  DELEGATE: 'DELEGATE',
} as const;

export const WorkflowApprovalType = {
  AND: 'AND',
  OR: 'OR',
} as const;


export const WorkflowStatuses = Object.values(WorkflowStatus);
export const WorkflowApproverStatuses = Object.values(WorkflowApproverStatus);
export const WorkflowApprovalTypes = Object.values(WorkflowApprovalType);


export type WorkflowStatus = typeof WorkflowStatus[keyof typeof WorkflowStatus];
export type WorkflowApproverStatus = typeof WorkflowApproverStatus[keyof typeof WorkflowApproverStatus];
export type WorkflowApprovalType = typeof WorkflowApprovalType [keyof typeof WorkflowApprovalType];


type IWorkflowApproverHasId = {
  user: IUserHasId,
  status: WorkflowApproverStatus,
}

export type IWorkflowApproverGroupHasId = {
  approvalType: WorkflowApprovalType
  approvers: IWorkflowApproverHasId[],
  isApproved: boolean,
};

export type IWorkflowHasId = {
  creator: IUserHasId,
  pageId: string,
  name?: string,
  comment?: string,
  status: WorkflowStatus,
  approverGroups: IWorkflowApproverGroupHasId[]
  createdAt: Date;
}


export type EditingApproverGroup = {
  _id?: string
  isApproved?: boolean
  approvalType: WorkflowApprovalType
  uuidForRenderList: string
  approvers: Array<{
    user: IUserHasId
    status?: WorkflowApproverStatus
  }>
}

export type IWorkflowPaginateResult = PaginateResult<IWorkflowHasId>

export type CreateWorkflowApproverGroupData = { approvers: Array<{ user: string }> };

export type CreateWorkflowData = {
  pageId: string,
  creator: string,
  name?: string,
  comment?: string,
  approverGroups: CreateWorkflowApproverGroupData[]
}

export type UpdateApproverGroupData = {
  groupId: string,
  shouldRemove?: boolean,
  approvalType?: WorkflowApprovalType,
  userIdsToAdd?: string[],
  userIdsToRemove?: string[],
}

export type CreateApproverGroupData = {
  groupIndex: number,
  approvalType: WorkflowApprovalType,
  userIdsToAdd: string[],
}
