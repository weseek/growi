import { serializeUserSecurely } from '~/server/models/serializers/user-serializer';

import { IWorkflowHasId } from '../../../interfaces/workflow';


export const serializeWorkflowSecurely = (workflow: IWorkflowHasId, isOnlyCreator = false): IWorkflowHasId => {

  workflow.creator = serializeUserSecurely(workflow.creator);
  if (isOnlyCreator) {
    return workflow;
  }

  workflow.approverGroups.forEach((approverGroup) => {
    approverGroup.approvers.forEach((approver) => {
      approver.user = serializeUserSecurely(approver.user);
    });
  });

  return workflow;
};
