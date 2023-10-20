import { useState, useCallback } from 'react';

import { apiv3Delete } from '~/client/util/apiv3-client';

import { IWorkflowApproverGroupReqForRenderList } from '../../interfaces/workflow';

export const deleteWorkflow = async(workflowId: string): Promise<void> => {
  await apiv3Delete(`/workflow/${workflowId}`);
};


// see: https://robinpokorny.medium.com/index-as-a-key-is-an-anti-pattern-e0349aece318
// When rendering with maps, without a unique key, unintended behavior can occur.
const createInitialApproverGroup = (): IWorkflowApproverGroupReqForRenderList => {
  return {
    approvalType: 'AND',
    approvers: [],
    uuidForRenderList: crypto.randomUUID(),
  };
};

type UseEditingApproverGroups = {
  editingApproverGroups: IWorkflowApproverGroupReqForRenderList[],
  updateApproverGroupHandler: (groupIndex: number, updateApproverGroupData: IWorkflowApproverGroupReqForRenderList) => void
  addApproverGroupHandler: (groupIndex: number) => void
  removeApproverGroupHandler: (groupIndex: number) => void
}

export const useEditingApproverGroups = (): UseEditingApproverGroups => {
  const [editingApproverGroups, setEditingApproverGroups] = useState<IWorkflowApproverGroupReqForRenderList[]>([createInitialApproverGroup()]);

  const updateApproverGroupHandler = useCallback((groupIndex: number, updateApproverGroupData: IWorkflowApproverGroupReqForRenderList) => {
    const clonedApproverGroups = [...editingApproverGroups];
    clonedApproverGroups[groupIndex] = updateApproverGroupData;
    setEditingApproverGroups(clonedApproverGroups);
  }, [editingApproverGroups]);

  const addApproverGroupHandler = useCallback((groupIndex: number) => {
    const clonedApproverGroups = [...editingApproverGroups];
    clonedApproverGroups.splice(groupIndex, 0, createInitialApproverGroup());
    setEditingApproverGroups(clonedApproverGroups);
  }, [editingApproverGroups]);

  const removeApproverGroupHandler = useCallback((groupIndex: number) => {
    const clonedApproverGroups = [...editingApproverGroups];
    clonedApproverGroups.splice(groupIndex, 1);
    setEditingApproverGroups(clonedApproverGroups);
  }, [editingApproverGroups]);

  return {
    editingApproverGroups, updateApproverGroupHandler, addApproverGroupHandler, removeApproverGroupHandler,
  };
};
