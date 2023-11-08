import React, { useState, useCallback, useMemo } from 'react';

import { useTranslation } from 'next-i18next';
import { ModalBody, ModalFooter } from 'reactstrap';

import {
  type IWorkflowHasId,
  type IWorkflowApproverGroupForRenderList,
  type WorkflowApprovalType,
  type CreateApproverGroupData,
  type UpdateApproverGroupData,
  WorkflowApproverStatus,
} from '~/features/approval-workflow/interfaces/workflow';

import { getLatestApprovedApproverGroupIndex } from '../../../utils/workflow';
import { useEditingApproverGroups } from '../../services/workflow';
import { useSWRxWorkflow } from '../../stores/workflow';

import { EditableApproverGroupCards } from './EditableApproverGroupCards';
import { WorkflowModalHeader } from './WorkflowModalHeader';

// Compare oldUserIds and newUserIds and extract the userId that has increased or decreased
const compareApproverDiff = (oldUserIds: string[], newUserIds: string[]): { userIdToAdd?: string, userIdToRemove?: string } => {
  const userIdToAdd = newUserIds.find(item => !oldUserIds.includes(item));
  const userIdToRemove = oldUserIds.find(item => !newUserIds.includes(item));
  return { userIdToAdd, userIdToRemove };
};

const getApprovedUserIds = (workflow: IWorkflowHasId): string[] => {
  const allApprovedUserIds: string[] = [];
  workflow.approverGroups.forEach((group) => {
    const ids = group.approvers
      .filter(approver => approver.status === WorkflowApproverStatus.APPROVE)
      .map(approver => approver.user._id);
    allApprovedUserIds.push(...ids);
  });

  return allApprovedUserIds;
};

type Props = {
  workflow: IWorkflowHasId
  onUpdated?: () => void
  onClickWorkflowDetailPageBackButton: () => void
}

export const WorkflowEditModalContent = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const { workflow, onUpdated, onClickWorkflowDetailPageBackButton } = props;

  const {
    editingApproverGroups, allEditingApproverIds, updateApproverGroupHandler, addApproverGroupHandler, removeApproverGroupHandler,
  } = useEditingApproverGroups(workflow.approverGroups);

  const { update: updateWorkflow } = useSWRxWorkflow(workflow?._id);

  const latestApprovedApproverGroupIndex = getLatestApprovedApproverGroupIndex(workflow);
  const excludedSearchUserIds = [workflow.creator._id, ...allEditingApproverIds];
  const allApprovedUserIds = useMemo(() => getApprovedUserIds(workflow), [workflow]);

  const [editingWorkflowName, setEditingWorkflowName] = useState<string | undefined>(workflow.name);
  const [editingWorkflowDescription, setEditingWorkflowDescription] = useState<string | undefined>(workflow.comment);
  const [updateApproverGroupData, setUpdateApproverGroupData] = useState<Array<UpdateApproverGroupData & { uuidForRender?: string }>>([]);

  const workflowNameChangeHandler = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEditingWorkflowName(event.target.value);
  }, []);

  const workflowDescriptionChangeHandler = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditingWorkflowDescription(event.target.value);
  }, []);

  const createRequestDataForCreate = useCallback((editingApproverGroups: IWorkflowApproverGroupForRenderList[]): CreateApproverGroupData[] => {
    const createApproverGroupData: CreateApproverGroupData[] = [];
    const notInDBApproverGroups = editingApproverGroups.filter(v => v._id == null);

    notInDBApproverGroups.forEach((notInDBApproverGroup) => {
      const groupIndex = editingApproverGroups
        .findIndex(editingApproverGroup => editingApproverGroup.uuidForRenderList === notInDBApproverGroup.uuidForRenderList);
      createApproverGroupData.push({
        groupIndex,
        approvalType: notInDBApproverGroup.approvalType,
        userIdsToAdd: notInDBApproverGroup.approvers.map(v => (typeof v.user === 'string' ? v.user : v.user._id)),
      });
    });

    return createApproverGroupData;
  }, []);

  const createRequestDataForUpdate = useCallback((
      groupId: string,
      uuidForRender: string,
      approvalType: WorkflowApprovalType,
      userIdToAdd?: string,
      userIdToRemove?: string,
  ) => {
    const clonedUpdateApproverGroupData = [...updateApproverGroupData];
    const targetUpdateApproverGroupData = clonedUpdateApproverGroupData.find(v => uuidForRender === v.uuidForRender);

    if (targetUpdateApproverGroupData != null) {
      targetUpdateApproverGroupData.approvalType = approvalType;

      if (userIdToAdd != null && !targetUpdateApproverGroupData.userIdsToAdd?.includes(userIdToAdd)) {
        targetUpdateApproverGroupData.userIdsToAdd?.push(userIdToAdd);

        const removeIndex = targetUpdateApproverGroupData.userIdsToRemove?.indexOf(userIdToAdd);
        if (removeIndex != null && removeIndex >= 0) targetUpdateApproverGroupData.userIdsToRemove?.splice(removeIndex, 1);
      }

      if (userIdToRemove != null && !targetUpdateApproverGroupData.userIdsToRemove?.includes(userIdToRemove)) {
        targetUpdateApproverGroupData.userIdsToRemove?.push(userIdToRemove);

        const removeIndex = targetUpdateApproverGroupData.userIdsToAdd?.indexOf(userIdToRemove);
        if (removeIndex != null && removeIndex >= 0) targetUpdateApproverGroupData.userIdsToAdd?.splice(removeIndex, 1);
      }
      setUpdateApproverGroupData(clonedUpdateApproverGroupData);
    }
    else {
      const newData = {
        groupId,
        uuidForRender,
        approvalType,
        userIdsToAdd: userIdToAdd != null ? [userIdToAdd] : [],
        userIdsToRemove: userIdToRemove != null ? [userIdToRemove] : [],
      };
      setUpdateApproverGroupData([...updateApproverGroupData, newData]);
    }
  }, [updateApproverGroupData]);

  const onUpdateApproverGroupsHandler = useCallback((groupIndex: number, approverGroup: IWorkflowApproverGroupForRenderList) => {
    const oldUserIds = editingApproverGroups[groupIndex].approvers.map(v => (typeof v.user === 'string' ? v.user : v.user._id));
    const newUserIds = approverGroup.approvers.map(v => (typeof v.user === 'string' ? v.user : v.user._id));
    const result = compareApproverDiff(oldUserIds, newUserIds);

    // If approverGroup already exists in DB
    if (approverGroup._id != null) {
      createRequestDataForUpdate(approverGroup._id, approverGroup.uuidForRenderList, approverGroup.approvalType, result.userIdToAdd, result.userIdToRemove);
    }

    updateApproverGroupHandler(groupIndex, approverGroup);
  }, [createRequestDataForUpdate, editingApproverGroups, updateApproverGroupHandler]);

  const onRemoveApproverGroupsHandler = useCallback((groupIndex: number) => {
    const targetEditingApproverGroup = editingApproverGroups[groupIndex];
    const clonedUpdateApproverGroupData = [...updateApproverGroupData];
    const targetUpdateApproverGroupData = clonedUpdateApproverGroupData.find(v => v.groupId === targetEditingApproverGroup._id);

    if (targetUpdateApproverGroupData != null && targetEditingApproverGroup._id != null) {
      targetUpdateApproverGroupData.shouldRemove = true;
      setUpdateApproverGroupData(clonedUpdateApproverGroupData);
    }
    else if (targetUpdateApproverGroupData == null && targetEditingApproverGroup._id != null) {
      setUpdateApproverGroupData([...clonedUpdateApproverGroupData, { groupId: targetEditingApproverGroup._id, shouldRemove: true }]);
    }

    removeApproverGroupHandler(groupIndex);
  }, [editingApproverGroups, removeApproverGroupHandler, updateApproverGroupData]);

  const clickSaveWorkflowButtonClickHandler = useCallback(async() => {
    const createApproverGroupData = createRequestDataForCreate(editingApproverGroups);

    try {
      const updateData = {
        name: editingWorkflowName,
        comment: editingWorkflowDescription,
        createApproverGroupData,
        updateApproverGroupData,
      };
      await updateWorkflow(updateData);

      if (onUpdated != null) {
        onUpdated();
      }
    }
    catch (err) {
      // TODO: Consider how to display errors
    }
  }, [createRequestDataForCreate, editingApproverGroups, editingWorkflowDescription, editingWorkflowName, onUpdated, updateApproverGroupData, updateWorkflow]);


  return (
    <>
      <WorkflowModalHeader
        title={t('approval_workflow.edit_workflow')}
        onClickPageBackButton={onClickWorkflowDetailPageBackButton}
      />

      <ModalBody>
        <div className="mb-3">
          <div className="row align-items-center">
            <label htmlFor="name" className="col-md-4 col-form-label">
              {t('approval_workflow.name')}
            </label>
            <div className="col-md-8 mb-3">
              <div className="row">
                <div className="col">
                  <input
                    className="form-control"
                    type="text"
                    name="name"
                    value={editingWorkflowName}
                    onChange={workflowNameChangeHandler}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <label htmlFor="description" className="col-md-4 col-form-label">
              {t('approval_workflow.description')}
            </label>
            <div className="col-md-8">
              <div className="row">
                <div className="col">
                  <textarea
                    className="form-control"
                    name="description"
                    value={editingWorkflowDescription}
                    onChange={workflowDescriptionChangeHandler}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <EditableApproverGroupCards
          editingApproverGroups={editingApproverGroups}
          approvedUserIds={allApprovedUserIds}
          excludedSearchUserIds={excludedSearchUserIds}
          latestApprovedApproverGroupIndex={latestApprovedApproverGroupIndex ?? undefined}
          onUpdateApproverGroups={onUpdateApproverGroupsHandler}
          onClickAddApproverGroupCard={addApproverGroupHandler}
          onClickRemoveApproverGroupCard={onRemoveApproverGroupsHandler}
        />
      </ModalBody>

      <ModalFooter>
        <button type="button">{t('approval_workflow.cancel')}</button>
        <button
          type="button"
          onClick={() => clickSaveWorkflowButtonClickHandler()}
        >{t('approval_workflow.completion')}
        </button>
      </ModalFooter>
    </>
  );
};
