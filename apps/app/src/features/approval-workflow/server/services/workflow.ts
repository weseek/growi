import type { IUserHasId } from '@growi/core';

import { ObjectIdLike } from '~/server/interfaces/mongoose-utils';
import loggerFactory from '~/utils/logger';

import {
  IWorkflow, IWorkflowReq, IWorkflowApproverGroupReq, WorkflowApprovalType, WorkflowApproverStatus,
} from '../../interfaces/workflow';
import Workflow from '../models/workflow';

const logger = loggerFactory('growi:service:workflow');

interface WorkflowService {
  createWorkflow(workflow: IWorkflowReq): Promise<IWorkflow>,
  deleteWorkflow(workflowId: ObjectIdLike, operator: IUserHasId): Promise<void>,
  validateApproverGroups(isNew: boolean, creatorId: ObjectIdLike, approverGroups: IWorkflowApproverGroupReq[]): void,
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

  async deleteWorkflow(workflowId: ObjectIdLike, operator: IUserHasId): Promise<void> {
    const targetWorkflow = await Workflow.findById(workflowId);
    if (targetWorkflow == null) {
      throw Error('Target workflow does not exist');
    }

    const operatorId = operator._id.toString();
    const creatorId = targetWorkflow.creator.toString();
    if (creatorId !== operatorId && !operator.admin) {
      throw Error('Only the person who created the workflow or has administrative privileges can delete it');
    }

    await targetWorkflow.delete();

    // TODO: Also delete the related WorkflowActivity (temporary) document

    return;
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

}

export const WorkflowService = new WorkflowServiceImpl();
