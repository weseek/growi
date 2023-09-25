import { useCallback, useState } from 'react';

import { apiv3Post, apiv3Delete } from '~/client/util/apiv3-client';

import { IWorkflowHasId, IWorkflowApproverGroupReq } from '../../interfaces/workflow';


export const useCreateWorkflow = (
    pageId?: string, name?: string, comment?: string, approverGroups?: IWorkflowApproverGroupReq[],
): { createdWorkflow: IWorkflowHasId | undefined, createWorkflow: () => Promise<IWorkflowHasId | undefined> } => {
  const [createdWorkflow, setCreatedWorkflow] = useState<IWorkflowHasId | undefined>();

  const createWorkflow = useCallback(async() => {
    if (pageId == null || approverGroups == null) {
      return;
    }
    const response = await apiv3Post('/workflow', {
      pageId, name, comment, approverGroups,
    });

    const createWorkflow = response.data.createdWorkflow as IWorkflowHasId | undefined;

    setCreatedWorkflow(createWorkflow);

    return createWorkflow;
  }, [approverGroups, comment, name, pageId]);

  return { createdWorkflow, createWorkflow };
};

export const deleteWorkflow = async(workflowId: string): Promise<void> => {
  await apiv3Delete(`/workflow/${workflowId}`);
};
