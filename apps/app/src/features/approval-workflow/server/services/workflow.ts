import type { IUserHasId } from '@growi/core';

import { ObjectIdLike } from '~/server/interfaces/mongoose-utils';
import loggerFactory from '~/utils/logger';

import {
  IWorkflow, IWorkflowHasId, IWorkflowReq, IWorkflowApproverGroupReq, WorkflowApprovalType, WorkflowStatus, WorkflowApproverStatus,
} from '../../interfaces/workflow';
import Workflow, { WorkflowDocument } from '../models/workflow';

const logger = loggerFactory('growi:service:workflow');

interface WorkflowService {
  createWorkflow(workflow: IWorkflowReq): Promise<IWorkflow>,
  deleteWorkflow(workflowId: ObjectIdLike): Promise<void>,
  approve(workflowId: ObjectIdLike, approverId: ObjectIdLike): Promise<void>,
  validateApproverGroups(isNew: boolean, creatorId: ObjectIdLike, approverGroups: IWorkflowApproverGroupReq[]): void,
  validateOperatableUser(workflow: IWorkflowHasId, operator: IUserHasId): void
}

class WorkflowServiceImpl implements WorkflowService {

  constructor() {
    this.validateApproverGroups = this.validateApproverGroups.bind(this);
  }

  async createWorkflow(workflow: IWorkflowReq): Promise<IWorkflow> {
    /*
    *  Validation
    */
    const hasInprogressWorkflowInTargetPage = await Workflow.hasInprogressWorkflowInTargetPage(workflow.pageId);
    if (hasInprogressWorkflowInTargetPage) {
      throw Error('An in-progress workflow already exists');
    }

    this.validateApproverGroups(true, workflow.creator, workflow.approverGroups);

    /*
    *  Create
    */
    const createdWorkflow = await Workflow.create(workflow);
    return createdWorkflow;
  }

  async deleteWorkflow(workflowId: ObjectIdLike): Promise<void> {
    const targetWorkflow = await Workflow.findById(workflowId);
    if (targetWorkflow == null) {
      throw Error('Target workflow does not exist');
    }

    await targetWorkflow.delete();

    // TODO: Also delete the related WorkflowActivity (temporary) document

    return;
  }

  async approve(workflowId: ObjectIdLike, operatorId: string): Promise<void> {
    const workflow = await Workflow.findById(workflowId);
    if (workflow == null) {
      throw Error('Target workflow does not exist');
    }

    if (workflow.status !== WorkflowStatus.INPROGRESS) {
      throw Error('Workflow is not in-progress');
    }

    const approver = workflow.findApprover(operatorId);
    if (approver == null) {
      throw Error('Operator is not an approver');
    }

    if (approver.status === WorkflowApproverStatus.APPROVE) {
      throw Error('Operator has already been approved');
    }

    const isFinalApprover = workflow.isFinalApprover(operatorId);
    if (isFinalApprover) {
      workflow.status = WorkflowStatus.APPROVE;
    }

    approver.status = WorkflowApproverStatus.APPROVE;

    await workflow.save();
  }

  validateApproverGroups(isNew: boolean, creatorId: ObjectIdLike, approverGroups: IWorkflowApproverGroupReq[]): void {
    const uniqueApprovers = new Set();
    uniqueApprovers.add(creatorId);

    approverGroups.forEach((approverGroup) => {
      if (approverGroup.approvers.length <= 1 && approverGroup.approvalType === WorkflowApprovalType.OR) {
        throw Error('approverGroup.approvalType cannot be set to "OR" when approverGroup.approvers.length is 1');
      }

      approverGroup.approvers.forEach((approver) => {
        if (uniqueApprovers.has(approver.user)) {
          throw Error('Cannot set the same approver within Workflow.ApproverGroups. Also, Workflow.creator cannot be set as an approver.');
        }
        uniqueApprovers.add(approver.user);

        if (isNew && approver.status != null && approver.status !== WorkflowApproverStatus.NONE) {
          throw Error('Cannot set approver.status to anything other than "NONE" during creation');
        }
      });
    });
  }

  // Call this method before performing operations (update, delete) on a Workflow document
  // Don't need to call this if workflows are deleted as a side effect, such as when deleting a page
  validateOperatableUser(workflow: IWorkflowHasId, operator: IUserHasId): void {
    if (operator.admin) {
      return;
    }

    const operatorId = operator._id.toString();
    const creatorId = workflow.creator.toString();

    const creatorAndApprovers: ObjectIdLike[] = [creatorId];
    workflow.approverGroups.forEach((approverGroup) => {
      approverGroup.approvers.forEach((approver) => {
        creatorAndApprovers.push(approver.user.toString());
      });
    });

    if (!creatorAndApprovers.includes(operatorId)) {
      throw Error('Only the workflow creator, workflow approver or administrator can operate it');
    }
  }

}

export const WorkflowService = new WorkflowServiceImpl();
