import type { IUserHasId, HasObjectId } from '@growi/core';


export type IWorkflowApproverStatus = {
  None: 'NONE',
  Apporve: 'APPROVE',
  Remand: 'REMAND',
  Delegate: 'DELEGATE',
}

export type IWorkflowStatus = {
  Inprogress: 'INPROGRESS',
  Approve: 'APPROVE',
  Reject: 'REJECT',
  Cancel: 'CANCEL'
}

export type IWorkflowTaskApprovalType = {
  And: 'AND',
  Or: 'OR',
}


export type IWorkflowApprover = {
  user: IUserHasId,
  status: IWorkflowApproverStatus,
}

export type IWorkflowTask = {
  approver: IWorkflowApprover[],
  approvalType: IWorkflowTaskApprovalType,
  isApproved?: boolean,
}

export type IWorkflow = {
  name: string,
  comment: string,
  pageId: string,
  status: IWorkflowStatus,
  tasks: IWorkflowTask,
}

export type IWorkflowHasId = IWorkflow & HasObjectId
