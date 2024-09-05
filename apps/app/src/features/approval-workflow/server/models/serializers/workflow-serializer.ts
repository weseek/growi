import { omitInsecureAttributes } from '@growi/core/dist/models/serializers';

import type { IWorkflowDocument } from '../workflow';


export const serializeWorkflowSecurely = (workflow: IWorkflowDocument, isOnlyCreator = false): IWorkflowDocument => {

  workflow.creator = omitInsecureAttributes(workflow.creator);
  if (isOnlyCreator) {
    return workflow;
  }

  workflow.approverGroups.forEach((approverGroup) => {
    approverGroup.approvers.forEach((approver) => {
      approver.user = omitInsecureAttributes(approver.user);
    });
  });

  return workflow;
};
