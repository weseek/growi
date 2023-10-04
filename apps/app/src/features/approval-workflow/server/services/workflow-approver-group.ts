
import type {
  IWorkflowHasId,
  IWorkflowApproverGroupHasId,
  IWorkflowApproverGroupReq,
  ApproverGroupUpdateData,
} from '../../interfaces/workflow';
import { WorkflowApprovalType, WorkflowApproverStatus } from '../../interfaces/workflow';

interface WorkflowApproverGroupService {
  updateApproverGroup(targetWorkflow: IWorkflowHasId, approverGroupData: ApproverGroupUpdateData[]): void
  removeApproverGroup(targetWorkflow: IWorkflowHasId, approevrGroup: IWorkflowApproverGroupHasId): void
  removeApprover(approverGroup: IWorkflowApproverGroupHasId, userIdsToRemove: string[]): void
  addApprover(approverGroup: IWorkflowApproverGroupHasId, userIdsToAdd: string[]): void
  validateApproverGroups(isNew: boolean, creatorId: string, approverGroups: IWorkflowApproverGroupReq[]): void
}
class WorkflowApproverGroupImpl implements WorkflowApproverGroupService {

  constructor() {
    this.removeApproverGroup = this.removeApproverGroup.bind(this);
    this.removeApprover = this.removeApprover.bind(this);
    this.addApprover = this.addApprover.bind(this);
    this.validateApproverGroups = this.validateApproverGroups.bind(this);
  }

  updateApproverGroup(targetWorkflow: IWorkflowHasId, approverGroupData: ApproverGroupUpdateData[]): void {
    const latestApprovedApproverGroupIndex = (targetWorkflow as any).getLatestApprovedApproverGroupIndex();

    for (const data of approverGroupData) {
      const approverGroup = (targetWorkflow as any).findApproverGroup(data.groupId);
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

    this.validateApproverGroups(false, targetWorkflow.creator._id, targetWorkflow.approverGroups as unknown as IWorkflowApproverGroupReq[]);

    return;
  }

  removeApproverGroup(targetWorkflow: IWorkflowHasId, approverGroup: IWorkflowApproverGroupHasId): void {
    const isIncludeApprovedApprover = approverGroup.approvers.some(v => v.status === WorkflowApproverStatus.APPROVE);
    if (isIncludeApprovedApprover) {
      throw Error('Cannot remove an approverGroup that contains approved approvers');
    }
    (targetWorkflow.approverGroups as any).pull({ _id: approverGroup._id });

    return;
  }

  removeApprover(approverGroup: IWorkflowApproverGroupHasId, userIdsToRemove: string[]): void {
    userIdsToRemove.forEach((userId) => {
      const approver = (approverGroup as any).findApprover(userId);

      if (approver == null) {
        throw Error('Target approver does not exist');
      }

      if (approver.status === WorkflowApproverStatus.APPROVE) {
        throw Error('Cannot remove an approved apporver');
      }

      (approverGroup.approvers as any).pull({ _id: approver._id });
    });

    return;
  }

  addApprover(approverGroup: IWorkflowApproverGroupHasId, userIdsToAdd: string[]): void {
    userIdsToAdd.forEach((userId) => { (approverGroup.approvers as any).push({ user: userId }) });

    return;
  }

  validateApproverGroups(isNew: boolean, creatorId: string, approverGroups: IWorkflowApproverGroupReq[]): void {
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
