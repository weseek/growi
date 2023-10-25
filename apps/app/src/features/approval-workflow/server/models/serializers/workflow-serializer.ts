import { serializeUserSecurely } from '~/server/models/serializers/user-serializer';

import { WorkflowDocument } from '../workflow';


export const serializeWorkflowSecurely = (workflow: WorkflowDocument, isOnlyCreator = false): WorkflowDocument => {

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
