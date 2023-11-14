import type { IUserHasId } from '@growi/core';

import { ObjectIdLike } from '~/server/interfaces/mongoose-utils';
import loggerFactory from '~/utils/logger';

import {
  WorkflowStatus,
  type CreateWorkflowData,
  type CreateApproverGroupData,
  type UpdateApproverGroupData,
} from '../../interfaces/workflow';
import Workflow, { type IWorkflowDocument } from '../models/workflow';

import { WorkflowApproverGroupService } from './workflow-approver-group';


const logger = loggerFactory('growi:service:workflow');

interface WorkflowService {
  createWorkflow(workflow: CreateWorkflowData): Promise<IWorkflowDocument>,
  deleteWorkflow(workflowId: ObjectIdLike): Promise<void>,
  updateWorkflow(
    workflowId: ObjectIdLike,
    operator: IUserHasId,
    name?: string,
    comment?: string,
    createApproverGroupData?: CreateApproverGroupData[],
    approverGroupUpdateData?: UpdateApproverGroupData[],
  ): Promise<IWorkflowDocument>,
  validateOperatableUser(workflow: IWorkflowDocument, operator: IUserHasId): void
}

class WorkflowServiceImpl implements WorkflowService {

  async createWorkflow(workflow: CreateWorkflowData): Promise<IWorkflowDocument> {
    const hasInprogressWorkflowInTargetPage = await Workflow.hasInprogressWorkflowInTargetPage(workflow.pageId);
    if (hasInprogressWorkflowInTargetPage) {
      throw Error('An in-progress workflow already exists');
    }

    WorkflowApproverGroupService.validateApproverGroups(true, workflow.creator.toString(), workflow.approverGroups);

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
      workflowId: ObjectIdLike,
      operator: IUserHasId,
      name?: string,
      comment?: string,
      createApproverGroupData?: CreateApproverGroupData[],
      updateApproverGroupData?: UpdateApproverGroupData[],
  ): Promise<IWorkflowDocument> {
    const targetWorkflow = await Workflow.findById(workflowId);
    if (targetWorkflow == null) {
      throw Error('Target workflow does not exist');
    }

    if (targetWorkflow.status !== WorkflowStatus.INPROGRESS) {
      throw Error('Cannot edit workflows that are not in progress');
    }

    this.validateOperatableUser(targetWorkflow, operator);

    if (createApproverGroupData != null && createApproverGroupData.length > 0) {
      WorkflowApproverGroupService.createApproverGroup(targetWorkflow, createApproverGroupData);
    }

    if (updateApproverGroupData != null && updateApproverGroupData.length > 0) {
      WorkflowApproverGroupService.updateApproverGroup(targetWorkflow, updateApproverGroupData);
    }

    WorkflowApproverGroupService.validateApproverGroups(
      false,
      targetWorkflow.creator.toString(),
      targetWorkflow.approverGroups,
    );

    targetWorkflow.name = name;
    targetWorkflow.comment = comment;

    const updatedWorkflow = await targetWorkflow.save();
    return updatedWorkflow;
  }

  // Call this method before performing operations (update, delete) on a Workflow document
  // Don't need to call this if workflows are deleted as a side effect, such as when deleting a page
  validateOperatableUser(workflow: IWorkflowDocument, operator: IUserHasId): void {
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
