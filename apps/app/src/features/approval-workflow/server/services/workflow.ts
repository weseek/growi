import type { IUserHasId } from '@growi/core';

import { ObjectIdLike } from '~/server/interfaces/mongoose-utils';
import loggerFactory from '~/utils/logger';

import {
  IWorkflow, IWorkflowHasId, IWorkflowReq, IWorkflowApproverGroup, IWorkflowApproverGroupReq, WorkflowApprovalType, WorkflowApproverStatus, WorkflowStatus,
} from '../../interfaces/workflow';
import Workflow from '../models/workflow';

const logger = loggerFactory('growi:service:workflow');

interface WorkflowService {
  createWorkflow(workflow: IWorkflowReq): Promise<IWorkflow>,
  deleteWorkflow(workflowId: ObjectIdLike): Promise<void>,
  updateWorkflow(workflowId: ObjectIdLike, operator: IUserHasId, updatedApproverGroups: IWorkflowApproverGroup[]): Promise<IWorkflowHasId>,
  validateApproverGroups(isNew: boolean, creatorId: ObjectIdLike, approverGroups: IWorkflowApproverGroupReq[]): void,
  validateOperatableUser(workflow: IWorkflowHasId, operator: IUserHasId): void
}

class WorkflowServiceImpl implements WorkflowService {

  constructor() {
    this.validateApproverGroups = this.validateApproverGroups.bind(this);
    this.validateOperatableUser = this.validateOperatableUser.bind(this);
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

  async updateWorkflow(workflowId: ObjectIdLike, operator: IUserHasId, updatedApproverGroups: IWorkflowApproverGroup[]): Promise<IWorkflowHasId> {
    const targetWorkflow = await Workflow.findById(workflowId);
    if (targetWorkflow == null) {
      throw Error('Target workflow does not exist');
    }

    if (targetWorkflow.status !== WorkflowStatus.INPROGRESS) {
      throw Error('Cannot edit workflows that are not in progress');
    }

    this.validateOperatableUser(targetWorkflow as unknown as IWorkflowHasId, operator);

    const latestApprovedApproverGroupIndex = targetWorkflow.getLatestApprovedApproverGroupIndex();

    const getUneditableApproverGrpups = (): IWorkflowApproverGroup[] => {
      if (latestApprovedApproverGroupIndex == null) {
        return [];
      }

      if (latestApprovedApproverGroupIndex === 0) {
        return targetWorkflow.approverGroups.slice(0, 1);
      }

      return targetWorkflow.approverGroups.slice(0, latestApprovedApproverGroupIndex);
    };

    const getEditableApproverGrpups = (): IWorkflowApproverGroup[] => {
      if (latestApprovedApproverGroupIndex == null) {
        return updatedApproverGroups;
      }

      if (latestApprovedApproverGroupIndex === 0) {
        return updatedApproverGroups.slice(1);
      }

      return updatedApproverGroups.slice(latestApprovedApproverGroupIndex);
    };

    const uneditableApproverGrpups = getUneditableApproverGrpups(); // from db
    const editableApproverGroups = getEditableApproverGrpups(); // from updatedApproverGroups

    const mergedApproverGroups = [...uneditableApproverGrpups, ...editableApproverGroups];

    this.validateApproverGroups(true, targetWorkflow.creator._id, editableApproverGroups);
    this.validateApproverGroups(false, targetWorkflow.creator._id, mergedApproverGroups);

    targetWorkflow.approverGroups = mergedApproverGroups;
    const updatedWorkflow = await targetWorkflow.save();
    return updatedWorkflow as unknown as IWorkflowHasId;
  }

  validateApproverGroups(isNew: boolean, creatorId: ObjectIdLike, approverGroups: IWorkflowApproverGroupReq[] | IWorkflowApproverGroup[]): void {
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
