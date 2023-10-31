import { useState, useCallback, useMemo } from 'react';

import { apiv3Delete } from '~/client/util/apiv3-client';

import { IWorkflowApproverGroupHasId, IWorkflowApproverGroupReqForRenderList, IWorkflowHasId } from '../../interfaces/workflow';

export const deleteWorkflow = async(workflowId: string): Promise<void> => {
  await apiv3Delete(`/workflow/${workflowId}`);
};


// see: https://robinpokorny.medium.com/index-as-a-key-is-an-anti-pattern-e0349aece318
// When rendering with maps, without a unique key, unintended behavior can occur.
const generateEmptyApproverGroup = (): IWorkflowApproverGroupReqForRenderList => {
  return {
    approvalType: 'AND',
    approvers: [],
    uuidForRenderList: crypto.randomUUID(),
  };
};

const setUUIDtoApproverGroups = (approverGroups: IWorkflowApproverGroupHasId[]): IWorkflowApproverGroupReqForRenderList[] => {
  return approverGroups.map((g) => { return { ...g, uuidForRenderList: crypto.randomUUID() } }) as unknown as IWorkflowApproverGroupReqForRenderList[];
};

const getAllApproverIds = (approverGroups: IWorkflowApproverGroupReqForRenderList[]): string[] => {
  const userIds: string[] = [];
  approverGroups.forEach((group) => {
    const ids = group.approvers.map(u => u.user.toString());
    userIds.push(...ids);
  });
  return userIds;
};

type UseEditingApproverGroups = {
  editingApproverGroups: IWorkflowApproverGroupReqForRenderList[]
  allEditingApproverIds: string[]
  updateApproverGroupHandler: (groupIndex: number, updateApproverGroupData: IWorkflowApproverGroupReqForRenderList) => void
  addApproverGroupHandler: (groupIndex: number) => void
  removeApproverGroupHandler: (groupIndex: number) => void
}

export const useEditingApproverGroups = (initialData?: IWorkflowApproverGroupHasId[]): UseEditingApproverGroups => {
  const initialApproverGroupData = initialData != null ? setUUIDtoApproverGroups(initialData) : [generateEmptyApproverGroup()];
  const [editingApproverGroups, setEditingApproverGroups] = useState<IWorkflowApproverGroupReqForRenderList[]>(initialApproverGroupData);

  const allEditingApproverIds = useMemo(() => getAllApproverIds(editingApproverGroups), [editingApproverGroups]);

  const updateApproverGroupHandler = useCallback((groupIndex: number, updateApproverGroupData: IWorkflowApproverGroupReqForRenderList) => {
    const clonedApproverGroups = [...editingApproverGroups];
    clonedApproverGroups[groupIndex] = updateApproverGroupData;
    setEditingApproverGroups(clonedApproverGroups);
  }, [editingApproverGroups]);

  const addApproverGroupHandler = useCallback((groupIndex: number) => {
    const clonedApproverGroups = [...editingApproverGroups];
    clonedApproverGroups.splice(groupIndex, 0, generateEmptyApproverGroup());
    setEditingApproverGroups(clonedApproverGroups);
  }, [editingApproverGroups]);

  const removeApproverGroupHandler = useCallback((groupIndex: number) => {
    const clonedApproverGroups = [...editingApproverGroups];
    clonedApproverGroups.splice(groupIndex, 1);
    setEditingApproverGroups(clonedApproverGroups);
  }, [editingApproverGroups]);

  return {
    editingApproverGroups,
    allEditingApproverIds,
    updateApproverGroupHandler,
    addApproverGroupHandler,
    removeApproverGroupHandler,
  };
};
