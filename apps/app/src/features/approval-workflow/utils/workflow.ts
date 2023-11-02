import { IWorkflowHasId } from '../interfaces/workflow';

export const getLatestApprovedApproverGroupIndex = (workflow: IWorkflowHasId): number | null => {
  const apprverGroupsLength = workflow.approverGroups.length;

  for (let i = apprverGroupsLength; i > 0; i--) {
    const groupIndex = i - 1;
    if (workflow.approverGroups[groupIndex].isApproved) {
      return groupIndex;
    }
  }

  return null;
};
