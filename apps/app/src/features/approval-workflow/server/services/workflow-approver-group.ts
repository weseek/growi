
import {
  IWorkflowHasId,
  WorkflowApprovalType,
  WorkflowApproverStatus,
  WorkflowStatus,
  ApproverGroupUpdateData,
} from '../../interfaces/workflow';

interface WorkflowApproverGroupService {
  updateApproverGroup(targetWorkflow: IWorkflowHasId, approverGroupData: ApproverGroupUpdateData): Promise<void>
}

class WorkflowApproverGroupImpl implements WorkflowApproverGroupService {

  async updateApproverGroup(targetWorkflow: IWorkflowHasId, approverGroupData: ApproverGroupUpdateData): Promise<void> {
    return;
  }

}

export const WorkflowApproverGroupService = new WorkflowApproverGroupImpl();
