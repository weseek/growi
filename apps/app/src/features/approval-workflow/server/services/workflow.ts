import type { IUserHasId } from '@growi/core';


import { ObjectIdLike } from '~/server/interfaces/mongoose-utils';
import loggerFactory from '~/utils/logger';

import {
  IWorkflow,
  IWorkflowHasId,
  IWorkflowReq,
  IWorkflowApproverGroup,
  IWorkflowApproverGroupReq,
  WorkflowApprovalType,
  WorkflowApproverStatus,
  WorkflowStatus,
  UpdateApproverGroupRequest,
} from '../../interfaces/workflow';
import Workflow from '../models/workflow';

const logger = loggerFactory('growi:service:workflow');

interface WorkflowService {
  createWorkflow(workflow: IWorkflowReq): Promise<IWorkflow>,
  deleteWorkflow(workflowId: ObjectIdLike): Promise<void>,
  updateWorkflow(
    workflowId: ObjectIdLike, operator: IUserHasId, approverGroupData: UpdateApproverGroupRequest[], name?: string, comment?: string,
  ): Promise<IWorkflowHasId>,
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

  async updateWorkflow(
      workflowId: ObjectIdLike, operator: IUserHasId, approverGroupData: UpdateApproverGroupRequest[], name?: string, comment?: string,
  ): Promise<IWorkflowHasId> {
    const targetWorkflow = await Workflow.findById(workflowId);
    if (targetWorkflow == null) {
      throw Error('Target workflow does not exist');
    }

    if (targetWorkflow.status !== WorkflowStatus.INPROGRESS) {
      throw Error('Cannot edit workflows that are not in progress');
    }

    this.validateOperatableUser(targetWorkflow as unknown as IWorkflowHasId, operator);

    const latestApprovedApproverGroupIndex = targetWorkflow.getLatestApprovedApproverGroupIndex();

    for (const data of approverGroupData) {
      const approverGroup = targetWorkflow.findApproverGroup(data.groupId);
      if (approverGroup == null) {
        throw Error('Target approevrGroup does not exist');
      }

      const groupIndex = targetWorkflow.approverGroups.findIndex(v => v._id.toString() === data.groupId);
      if (latestApprovedApproverGroupIndex != null && latestApprovedApproverGroupIndex >= groupIndex) {
        throw Error('Cannot edit approverGroups prior to the Approved approverGroup');
      }

      // Remove ApporverGroup
      if (data.shouldRemove) {
        (targetWorkflow.approverGroups as any).pull({ _id: approverGroup._id });
        continue;
      }

      // Change ApprovalType
      if (data.approvalType != null) {
        approverGroup.approvalType = data.approvalType;
      }

      // Remove Approver
      if (data.userIdsToRemove != null) {
        data.userIdsToRemove.forEach((userId) => {
          const approver = (approverGroup as any).findApprover(userId);

          if (approver == null) {
            throw Error('Target approver does not exist');
          }

          if (approver.status === WorkflowApproverStatus.APPROVE) {
            throw Error('Cannot remove an approved apporver');
          }

          (approverGroup.approvers as any).pull({ _id: approver._id });
        });
      }

      // Add Approver
      if (data.userIdsToAdd != null) {
        data.userIdsToAdd.forEach((userId) => {
          (approverGroup.approvers as any).push({ user: userId });
        });
      }
    }

    this.validateApproverGroups(false, targetWorkflow.creator._id, targetWorkflow.approverGroups);

    targetWorkflow.name = name;
    targetWorkflow.comment = comment;

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
