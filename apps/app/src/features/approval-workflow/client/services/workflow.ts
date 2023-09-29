import { apiv3Delete } from '~/client/util/apiv3-client';

export const deleteWorkflow = async(workflowId: string): Promise<void> => {
  await apiv3Delete(`/workflow/${workflowId}`);
};
