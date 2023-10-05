import type { IUserHasId, HasObjectId } from '@growi/core';

import type { PaginateResult } from '~/interfaces/mongoose-utils';
import type { ObjectIdLike } from '~/server/interfaces/mongoose-utils';


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


type WorkflowStatus = typeof WorkflowStatus[keyof typeof WorkflowStatus];
type WorkflowApproverStatus = typeof WorkflowApproverStatus[keyof typeof WorkflowApproverStatus];
type WorkflowApprovalType = typeof WorkflowApprovalType [keyof typeof WorkflowApprovalType];


export type IWorkflowApprover = {
  user: IUserHasId,
  status: WorkflowApproverStatus,
}

export type IWorkflowApproverGroup = {
  approvalType: WorkflowApprovalType
  approvers: IWorkflowApprover[],
  isApproved: boolean, // virtual
};

export type IWorkflow = {
  creator: IUserHasId,
  pageId: ObjectIdLike,
  name?: string,
  comment?: string,
  status: WorkflowStatus,
  approverGroups: IWorkflowApproverGroup[]
  createdAt: Date;
}

export type IWorkflowApproverReq = Omit<IWorkflowApprover, 'user' | 'status'> & { user: ObjectIdLike, status?: WorkflowApproverStatus }
export type IWorkflowApproverGroupReq = Omit<IWorkflowApproverGroup, 'isApproved' | 'approvers'> & { approvers: IWorkflowApproverReq[] }
export type IWorkflowReq = Omit<IWorkflow, '_id' | 'creator' | 'approverGroups' | 'createdAt'>
  & { creator: ObjectIdLike, approverGroups: IWorkflowApproverGroupReq[] }

// TODO: If you don't need it, delete it
export type IWorkflowApproverHasId = IWorkflowApprover & HasObjectId;
export type IWorkflowApproverGroupHasId = Omit<IWorkflowApproverGroup, 'approvers'> & { approvers: IWorkflowApproverHasId[] } & HasObjectId;
export type IWorkflowHasId = Omit<IWorkflow, 'approverGroups'> & { approverGroups: IWorkflowApproverGroupHasId[] } & HasObjectId;

export type IWorkflowPaginateResult = PaginateResult<IWorkflowHasId>


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
