import { useState, useCallback, useMemo } from 'react';

import { apiv3Delete } from '~/client/util/apiv3-client';

import type {
  IWorkflowApproverGroupHasId,
  EditingApproverGroup,
} from '../../interfaces/workflow';

export const deleteWorkflow = async(workflowId: string): Promise<void> => {
  await apiv3Delete(`/workflow/${workflowId}`);
};


// see: https://robinpokorny.medium.com/index-as-a-key-is-an-anti-pattern-e0349aece318
// When rendering with maps, without a unique key, unintended behavior can occur.
const generateEmptyApproverGroup = (): EditingApproverGroup => {
  return {
    approvalType: 'AND',
    approvers: [],
    uuidForRenderList: crypto.randomUUID(),
  };
};

const setUUIDtoApproverGroups = (approverGroups: IWorkflowApproverGroupHasId[]): EditingApproverGroup[] => {
  return approverGroups.map((g) => { return { ...g, uuidForRenderList: crypto.randomUUID() } });
};

const getAllApproverIds = (approverGroups: EditingApproverGroup[]): string[] => {
  const userIds: string[] = [];
  approverGroups.forEach((group) => {
    const ids = group.approvers.map((approver) => { return typeof approver.user === 'string' ? approver.user : approver.user._id });
    userIds.push(...ids);
  });
  return userIds;
};

// type UseEditingApproverGroupsForCreate = {
//   editingApproverGroups: IWorkflowApproverGroupReqForRenderList[]
//   allEditingApproverIds: string[]
//   updateApproverGroupHandler: (groupIndex: number, updateApproverGroupData: IWorkflowApproverGroupReqForRenderList) => void
//   addApproverGroupHandler: (groupIndex: number) => void
//   removeApproverGroupHandler: (groupIndex: number) => void
// }

// type UseEditingApproverGroupsForUpdate = {
//   editingApproverGroups: IWorkflowApproverGroupForRenderList[]
//   allEditingApproverIds: string[]
//   updateApproverGroupHandler: (groupIndex: number, updateApproverGroupData: IWorkflowApproverGroupForRenderList) => void
//   addApproverGroupHandler: (groupIndex: number) => void
//   removeApproverGroupHandler: (groupIndex: number) => void
// }

// export function useEditingApproverGroups(): UseEditingApproverGroupsForCreate
// export function useEditingApproverGroups(initialData: IWorkflowApproverGroupHasId[]): UseEditingApproverGroupsForUpdate


// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useEditingApproverGroups(initialData?: IWorkflowApproverGroupHasId[]) {
  const initialApproverGroupData = initialData != null ? setUUIDtoApproverGroups(initialData) : [generateEmptyApproverGroup()];
  const [editingApproverGroups, setEditingApproverGroups] = useState<EditingApproverGroup[]>(initialApproverGroupData);

  const allEditingApproverIds = useMemo(() => getAllApproverIds(editingApproverGroups), [editingApproverGroups]);

  const updateApproverGroupHandler = useCallback((groupIndex: number, updateApproverGroupData: EditingApproverGroup) => {
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
}
