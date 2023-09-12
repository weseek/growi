import {
  IWorkflow, IWorkflowApproverGroup, WorkflowApprovalType, WorkflowApproverStatus, WorkflowStatus,
} from '~/interfaces/workflow';
import Workflow from '~/server/models/workflow';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:workflow');

interface WorkflowService {
  createWorkflow(creatorId: string, pageId: string, name: string, comment: string, approverGroups: IWorkflowApproverGroup[]): Promise<IWorkflow>,
  validateApproverGroups(isNew: boolean, creatorId: string, approverGroups: IWorkflowApproverGroup[]): void,
}

class WorkflowServiceImpl implements WorkflowService {

  constructor() {
    this.validateApproverGroups = this.validateApproverGroups.bind(this);
  }

  async createWorkflow(creatorId: string, pageId: string, name: string, comment: string, approverGroups: IWorkflowApproverGroup[]): Promise<IWorkflow> {
    /*
    *  Validation
    */
    const hasInprogressWorkflowInTargetPage = await Workflow.hasInprogressWorkflowInTargetPage(pageId);
    if (hasInprogressWorkflowInTargetPage) {
      throw Error('An in-progress workflow already exists');
    }

    this.validateApproverGroups(true, creatorId, approverGroups);

    /*
    *  Create
    */
    const createdWorkflow = await Workflow.create({
      creator: creatorId,
      status: WorkflowStatus.INPROGRESS,
      pageId,
      name,
      comment,
      approverGroups,
    });

    return createdWorkflow;
  }

  validateApproverGroups(isNew: boolean, creatorId: string, approverGroups: IWorkflowApproverGroup[]): void {
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
