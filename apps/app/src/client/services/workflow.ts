import { useCallback, useState } from 'react';

import { apiv3Post } from '~/client/util/apiv3-client';
import { IWorkflowHasId, IWorkflowApproverGroupReq } from '~/interfaces/workflow';


export const useCreateWorkflow = (
    pageId?: string, name?: string, comment?: string, approverGroups?: IWorkflowApproverGroupReq[],
): { createdWorkflow: IWorkflowHasId | undefined, createWorkflow: () => Promise<void> } => {
  const [createdWorkflow, setCreatedWorkflow] = useState<IWorkflowHasId | undefined>();

  const createWorkflow = useCallback(async() => {
    if (pageId == null || approverGroups == null) {
      return;
    }
    const response = await apiv3Post('/workflow', {
      pageId, name, comment, approverGroups,
    });
    setCreatedWorkflow(response.data.setCreatedWorkflow as IWorkflowHasId | undefined);
  }, [approverGroups, comment, name, pageId]);

  return { createdWorkflow, createWorkflow };
};
