import type { Ref, IUser } from '@growi/core';

import {
  WorkflowApprovalType,
  WorkflowApproverStatus,
  type UpdateApproverGroupData,
  type CreateApproverGroupData,
} from '../../interfaces/workflow';
import { getLatestApprovedApproverGroupIndex } from '../../utils/workflow';
import type {
  IWorkflowDocument, WorkflowDocument, IWorkflowApproverGroupDocument, WorkflowApproverGroupDocument,
} from '../models/workflow';


// WorkflowApproverGroupDocumentWithoutArraySplice omit Array.prototype.splice(), so ValidateApproverGroupArg also omit it
type ValidateApproverGroupArg = Omit<Array<{
  approvalType: WorkflowApprovalType,
  approvers: Array<{
    user: Ref<IUser>
    status?: WorkflowApproverStatus
  }>
}>, 'splice'>

interface WorkflowApproverGroupService {
  createApproverGroup(targetWorkflow: WorkflowDocument, createApproverGroupData: CreateApproverGroupData[]): void
  updateApproverGroup(targetWorkflow: WorkflowDocument, updateApproverGroupData: UpdateApproverGroupData[]): void
  validateApproverGroups(isNew: boolean, creatorId: string, approverGroups: any): void
}
class WorkflowApproverGroupImpl implements WorkflowApproverGroupService {

  // This method should be used after passing the validation of WorkflowService.updateWorkflow()
  createApproverGroup(targetWorkflow: WorkflowDocument, createApproverGroupData: CreateApproverGroupData[]): void {
    const latestApprovedApproverGroupIndex = getLatestApprovedApproverGroupIndex(targetWorkflow);

    for (const data of createApproverGroupData) {
      if (latestApprovedApproverGroupIndex != null && latestApprovedApproverGroupIndex >= data.groupIndex) {
        throw Error('Cannot edit approverGroups prior to the approved approverGroup');
      }

      const newApproverGroup = {
        approvers: data.userIdsToAdd.map(userId => ({ user: userId })),
        approvalType: data.approvalType,
      };

      targetWorkflow.approverGroups.splice(data.groupIndex, 0, newApproverGroup);
    }

    return;
  }

  // This method should be used after passing the validation of WorkflowService.updateWorkflow()
  updateApproverGroup(targetWorkflow: WorkflowDocument, updateApproverGroupData: UpdateApproverGroupData[]): void {
    const latestApprovedApproverGroupIndex = getLatestApprovedApproverGroupIndex(targetWorkflow);

    for (const data of updateApproverGroupData) {
      const approverGroup = targetWorkflow.approverGroups.id(data.groupId);

      if (approverGroup == null) {
        throw Error('Target approevrGroup does not exist');
      }

      const groupIndex = targetWorkflow.approverGroups.findIndex(v => v._id.toString() === data.groupId);
      if (latestApprovedApproverGroupIndex != null && latestApprovedApproverGroupIndex >= groupIndex) {
        throw Error('Cannot edit approverGroups prior to the approved approverGroup');
      }

      // Remove ApporverGroup
      if (data.shouldRemove) {
        this.removeApproverGroup(targetWorkflow, approverGroup);
        continue;
      }

      // Change ApprovalType
      if (data.approvalType != null) {
        approverGroup.approvalType = data.approvalType;
      }

      // Remove Approver
      if (data.userIdsToRemove != null && data.userIdsToRemove.length > 0) {
        this.removeApprover(approverGroup, data.userIdsToRemove);
      }

      // Add Approver
      if (data.userIdsToAdd != null && data.userIdsToAdd.length > 0) {
        this.addApprover(approverGroup, data.userIdsToAdd);
      }
    }

    return;
  }

  private removeApproverGroup(targetWorkflow: IWorkflowDocument, approverGroup: WorkflowApproverGroupDocument): void {
    const isIncludeApprovedApprover = approverGroup.approvers.some(v => v.status === WorkflowApproverStatus.APPROVE);
    if (isIncludeApprovedApprover) {
      throw Error('Cannot remove an approverGroup that contains approved approvers');
    }

    targetWorkflow.approverGroups.pull(approverGroup._id);

    return;
  }

  private removeApprover(approverGroup: WorkflowApproverGroupDocument, userIdsToRemove: string[]): void {
    userIdsToRemove.forEach((userId) => {
      const approver = approverGroup.findApprover(userId);

      if (approver != null && approver.status === WorkflowApproverStatus.APPROVE) {
        throw Error('Cannot remove an approved apporver');
      }

      approverGroup.approvers.pull(approver?._id);
    });

    return;
  }

  private addApprover(approverGroup: IWorkflowApproverGroupDocument, userIdsToAdd: string[]): void {
    userIdsToAdd.forEach((userIdToAdd) => {
      const userIds = approverGroup.approvers.map(v => v.user.toString());

      if (!userIds.includes(userIdToAdd)) {
        approverGroup.approvers.push({ user: userIdToAdd });
      }
    });

    return;
  }

  validateApproverGroups(isNew: boolean, creatorId: string, approverGroups: ValidateApproverGroupArg): void {
    const uniqueApprovers = new Set<string>();
    uniqueApprovers.add(creatorId);

    approverGroups.forEach((approverGroup) => {
      if (approverGroup.approvers.length <= 1 && approverGroup.approvalType === WorkflowApprovalType.OR) {
        throw Error('approverGroup.approvalType cannot be set to "OR" when approverGroup.approvers.length is 1');
      }

      approverGroup.approvers.forEach((approver) => {
        if (uniqueApprovers.has(approver.user.toString())) {
          throw Error('Cannot set the same approver within Workflow.ApproverGroups. Also, Workflow.creator cannot be set as an approver.');
        }
        uniqueApprovers.add(approver.user.toString());

        if (isNew && approver.status != null && approver.status !== WorkflowApproverStatus.NONE) {
          throw Error('Cannot set approver.status to anything other than "NONE" during creation');
        }
      });
    });
  }

}

export const WorkflowApproverGroupService = new WorkflowApproverGroupImpl();
