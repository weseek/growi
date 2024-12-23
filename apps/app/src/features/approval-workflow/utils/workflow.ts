import type { IWorkflowHasId } from '../interfaces/workflow';
import type { IWorkflowDocument } from '../server/models/workflow';

export const getLatestApprovedApproverGroupIndex = (workflow: IWorkflowHasId | IWorkflowDocument): number | null => {
  const apprverGroupsLength = workflow.approverGroups.length;

  for (let i = apprverGroupsLength; i > 0; i--) {
    const groupIndex = i - 1;
    if (workflow.approverGroups[groupIndex].isApproved) {
      return groupIndex;
    }
  }

  return null;
};

export const isWorkflowNameSet = (workflowName?: string): boolean => {
  if (workflowName == null || workflowName.trim() === '') {
    return false;
  }

  return true;
};
