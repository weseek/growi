import type { IUserHasId, HasObjectId } from '@growi/core';


const WORKFLOW_STATUS = {
  INPROGRESS: 'INPROGRESS',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  CANCEL: 'CANCEL',
} as const;

const WORKFLOW_APPROVER_STATUS = {
  NONE: 'NONE',
  APPROVE: 'APPROVE',
  REMAND: 'REMAND',
  DELEGATE: 'DELEGATE',
} as const;

const WORKFLOW_APPROVAL_TYPE = {
  AND: 'AND',
  OR: 'OR',
} as const;


type IWorkflowApproverStatus = typeof WORKFLOW_APPROVER_STATUS[keyof typeof WORKFLOW_APPROVER_STATUS];

type IWorkflowStatus = typeof WORKFLOW_STATUS[keyof typeof WORKFLOW_STATUS];

type IWorkflowApprovalType = typeof WORKFLOW_APPROVAL_TYPE[keyof typeof WORKFLOW_APPROVAL_TYPE];

type IWorkflowApprover = {
  user: IUserHasId,
  status: IWorkflowApproverStatus,
}

type IWorkflowApproverGroup = {
  approvalType: IWorkflowApprovalType
  approveres: (IWorkflowApprover | IWorkflowApproverGroup)[],
};

export type IWorkflow = {
  creator: IUserHasId,
  name: string,
  comment: string,
  pageId: string,
  status: IWorkflowStatus,
  approverGroups: IWorkflowApproverGroup[]
}
export type IWorkflowHasId = IWorkflow & HasObjectId
