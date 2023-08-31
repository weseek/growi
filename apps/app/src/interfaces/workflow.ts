import type { IUserHasId, HasObjectId } from '@growi/core';


const WorkflowStatus = {
  INPROGRESS: 'INPROGRESS',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  CANCEL: 'CANCEL',
} as const;

const WorkflowApproverStatus = {
  NONE: 'NONE',
  APPROVE: 'APPROVE',
  REMAND: 'REMAND',
  DELEGATE: 'DELEGATE',
} as const;

const WorkflowApprovalType = {
  AND: 'AND',
  OR: 'OR',
} as const;


type WorkflowStatus = typeof WorkflowStatus[keyof typeof WorkflowStatus];
type WorkflowApproverStatus = typeof WorkflowApproverStatus[keyof typeof WorkflowApproverStatus];
type WorkflowApprovalType = typeof WorkflowApprovalType [keyof typeof WorkflowApprovalType];


type IWorkflowApprover = {
  user: IUserHasId,
  status: WorkflowApproverStatus,
}

type IWorkflowApproverGroup = {
  approvalType: WorkflowApprovalType
  approvers: (IWorkflowApprover | IWorkflowApproverGroup)[],
};

export type IWorkflow = {
  creator: IUserHasId,
  name: string,
  comment: string,
  pageId: string,
  status: WorkflowStatus,
  approverGroups: IWorkflowApproverGroup[]
}
export type IWorkflowHasId = IWorkflow & HasObjectId
