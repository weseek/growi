import type { IUserHasId, HasObjectId } from '@growi/core';


const WORKFLOW_APPROVER_STATUS = {
  NONE: 'NONE',
  APPROVE: 'APPROVE',
  REMAND: 'REMAND',
  DELEGATE: 'DELEGATE',
} as const;
type IWorkflowApproverStatus = typeof WORKFLOW_APPROVER_STATUS[keyof typeof WORKFLOW_APPROVER_STATUS];


const WORKFLOW_STATUS = {
  INPROGRESS: 'INPROGRESS',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  CANCEL: 'CANCEL',
} as const;
type IWorkflowStatus = typeof WORKFLOW_STATUS[keyof typeof WORKFLOW_STATUS];


const WORKFLOW_APPROVAL_TYPE = {
  AND: 'AND',
  OR: 'OR',
} as const;
export type IWorkflowApprovalType = typeof WORKFLOW_APPROVAL_TYPE[keyof typeof WORKFLOW_APPROVAL_TYPE];


export type IWorkflowApprover = {
  user: IUserHasId,
  status: IWorkflowApproverStatus,
}

export type IWorkflowApproverGroup = {
  approvalType: IWorkflowApprovalType
  approveres: (IWorkflowApprover | IWorkflowApproverGroup)[],
};

export type IWorkflow = {
  name: string,
  comment: string,
  pageId: string,
  status: IWorkflowStatus,
  approverGroup: IWorkflowApproverGroup[]
}
export type IWorkflowHasId = IWorkflow & HasObjectId
