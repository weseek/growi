import { serializeUserSecurely } from '~/server/models/serializers/user-serializer';

import { IWorkflowDocument } from '../workflow';


export const serializeWorkflowSecurely = (workflow: IWorkflowDocument, isOnlyCreator = false): IWorkflowDocument => {

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
