import React, { useState, useCallback } from 'react';

import type { IUserHasId } from '@growi/core';
import { useTranslation } from 'next-i18next';
import {
  Dropdown, DropdownMenu, DropdownToggle, DropdownItem, UncontrolledTooltip,
} from 'reactstrap';

import { WorkflowApprovalType, type EditingApproverGroup } from '../../../interfaces/workflow';

import { SearchUserTypeahead } from './SearchUserTypeahead';


type Props = {
  excludedSearchUserIds: string[]
  approvedApproverIds?: string[]
  editingApproverGroups: EditingApproverGroup[]
  latestApprovedApproverGroupIndex?: number
  onUpdateApproverGroups?: (groupIndex: number, updateApproverGroupData: EditingApproverGroup) => void
  onClickAddApproverGroupCard?: (groupIndex: number) => void
  onClickRemoveApproverGroupCard?: (groupIndex: number) => void
}

const EditableApproverGroupCard = (props: Props & { groupIndex: number, isLastApproverGroup: boolean }): JSX.Element => {
  const {
    groupIndex,
    approvedApproverIds,
    editingApproverGroups,
    excludedSearchUserIds,
    latestApprovedApproverGroupIndex,
    onUpdateApproverGroups,
    onClickAddApproverGroupCard,
    onClickRemoveApproverGroupCard,
    isLastApproverGroup,
  } = props;

  const { t } = useTranslation();

  const [isOpenChangeApprovalTypeMenu, setIsOpenChangeApprovalTypeMenu] = useState(false);

  const editingApproverGroup = editingApproverGroups?.[groupIndex];
  const editingApprovalType = editingApproverGroup.approvalType ?? WorkflowApprovalType.AND;

  const isEditable = latestApprovedApproverGroupIndex == null ? true : groupIndex > latestApprovedApproverGroupIndex;
  const isCreatableButtomApproverGroup = (isEditable && editingApproverGroup.approvers.length > 0) || (groupIndex === latestApprovedApproverGroupIndex);
  const isCreatableTopApporverGroup = isCreatableButtomApproverGroup && groupIndex === 0;
  const isDeletebleEditingApproverGroup = isEditable && editingApproverGroups.length > 1;
  const isChangeableApprovealType = isEditable && editingApproverGroup.approvers.length > 1;
  const isApprovalTypeAnd = editingApprovalType === WorkflowApprovalType.AND;

  // for updated
  const selectedUsers = editingApproverGroup.approvers.map(approver => approver.user);

  const changeApprovalTypeButtonClickHandler = useCallback((approvalType: WorkflowApprovalType) => {
    const clonedApproverGroup = { ...editingApproverGroup };
    clonedApproverGroup.approvalType = approvalType;

    if (onUpdateApproverGroups != null) {
      onUpdateApproverGroups(groupIndex, clonedApproverGroup);
    }
  }, [editingApproverGroup, groupIndex, onUpdateApproverGroups]);

  const updateApproversHandler = useCallback((users: IUserHasId[]) => {
    const clonedApproverGroup = { ...editingApproverGroup };
    const approvers = users.map(user => ({ user }));
    clonedApproverGroup.approvers = approvers;

    if (users.length <= 1) {
      clonedApproverGroup.approvalType = WorkflowApprovalType.AND;
    }

    if (onUpdateApproverGroups != null) {
      onUpdateApproverGroups(groupIndex, clonedApproverGroup);
    }
  }, [editingApproverGroup, groupIndex, onUpdateApproverGroups]);

  const removeApproverHandler = useCallback((user: IUserHasId) => {
    const clonedApproverGroup = { ...editingApproverGroup };
    clonedApproverGroup.approvers = clonedApproverGroup.approvers.filter(v => v.user._id !== user._id);

    if (clonedApproverGroup.approvers.length <= 1) {
      clonedApproverGroup.approvalType = WorkflowApprovalType.AND;
    }

    if (onUpdateApproverGroups != null) {
      onUpdateApproverGroups(groupIndex, clonedApproverGroup);
    }
  }, [editingApproverGroup, groupIndex, onUpdateApproverGroups]);

  const removeApproverGroupCardHandler = useCallback(() => {
    if (onClickRemoveApproverGroupCard != null && isDeletebleEditingApproverGroup) {
      onClickRemoveApproverGroupCard(groupIndex);
    }
  }, [groupIndex, isDeletebleEditingApproverGroup, onClickRemoveApproverGroupCard]);

  return (
    <>
      {onClickAddApproverGroupCard != null && groupIndex === 0 && (
        <div className="d-flex justify-content-center my-2">
          <div className="row w-75">
            <div className="col-5"></div>
            <div className="col-7">
              <button
                type="button"
                disabled={!isCreatableTopApporverGroup}
                onClick={() => onClickAddApproverGroupCard(Math.max(0, groupIndex - 1))}
                className="btn btn-link w-100 p-0 border-0 opacity-100"
              >
                <div className="container">
                  <div className="row">
                    <div className="col-2">
                      <span className="material-symbols-outlined text-light bg-secondary rounded-circle">add</span>
                    </div>
                    <div className="col-10 ps-2 text-start">
                      {t('approval_workflow.add_flow')}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card rounded">
        <div className="container row p-0 mx-auto">
          <div className="col-1 py-3 d-flex justify-content-center align-items-center border-end border-secondary-subtle">
            <span className="material-symbols-outlined">
              drag_indicator
            </span>
          </div>
          <div className="col-11 py-3">
            <div className="d-flex justify-content-center align-items-center">
              <SearchUserTypeahead
                isEditable={isEditable}
                selectedUsers={selectedUsers}
                approvedApproverIds={approvedApproverIds}
                excludedSearchUserIds={excludedSearchUserIds}
                onChange={updateApproversHandler}
                onRemoveApprover={removeApproverHandler}
                onRemoveLastEddtingApprover={removeApproverGroupCardHandler}
              />

              {isDeletebleEditingApproverGroup && onClickRemoveApproverGroupCard != null && (
                <button type="button" className="btn-close justify-content-end" aria-label="Close" onClick={removeApproverGroupCardHandler}></button>
              )}
            </div>

            <div className="d-flex justify-content-center align-items-center mt-3">

              <span className="text-muted me-2">
                {t('approval_workflow.completion_conditions')}
              </span>

              <Dropdown isOpen={isOpenChangeApprovalTypeMenu} toggle={() => { setIsOpenChangeApprovalTypeMenu(!isOpenChangeApprovalTypeMenu) }}>
                <div id="change-approval-type-button">
                  <DropdownToggle
                    className="btn btn-sm rounded-pill dropdown-toggle px-3 border border-dark-subtle"
                    disabled={!isChangeableApprovealType}
                    color="light"
                  >
                    {t(`approval_workflow.approval_type.${editingApprovalType}`)}
                  </DropdownToggle>
                  {/* see: https://stackoverflow.com/questions/52180239/how-add-tooltip-for-disabed-button-reactstrap */}
                  {!isChangeableApprovealType && (
                    <UncontrolledTooltip
                      target="change-approval-type-button"
                      placement="bottom"
                      fade={false}
                    >
                      {t('approval_workflow.cannot_change_approval_type')}
                    </UncontrolledTooltip>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownItem
                    onClick={() => changeApprovalTypeButtonClickHandler(isApprovalTypeAnd ? WorkflowApprovalType.OR : WorkflowApprovalType.AND)}
                  >  {isApprovalTypeAnd
                      ? <>{t('approval_workflow.approval_type.OR')}</>
                      : <>{t('approval_workflow.approval_type.AND')}</>
                    }
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>

      {onClickAddApproverGroupCard != null && !isLastApproverGroup && (
        <div className="d-flex justify-content-center my-2">
          <div className="row w-75">
            <div className="col-5"></div>
            <div className="col-7">
              <button
                type="button"
                disabled={!isCreatableTopApporverGroup}
                onClick={() => onClickAddApproverGroupCard(Math.max(0, groupIndex - 1))}
                className="btn btn-link w-100 p-0 border-0 opacity-100"
              >
                <div className="container">
                  <div className="row">
                    <div className="col-2">
                      <span className="material-symbols-outlined text-light bg-secondary rounded-circle">add</span>
                    </div>
                    <div className="col-10 ps-2 text-start">
                      {t('approval_workflow.add_flow')}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {onClickAddApproverGroupCard != null && isLastApproverGroup && (
        <div className="rounded bg-light-subtle mt-5">
          <button
            type="button"
            className="btn btn-link w-100 my-2"
            disabled={!isCreatableTopApporverGroup}
            onClick={() => onClickAddApproverGroupCard(Math.max(0, groupIndex + 1))}
          >
            <div className="container d-flex justify-content-center">
              <span className="material-symbols-outlined">add</span>
              <div>
                {t('approval_workflow.add_flow')}
              </div>
            </div>
          </button>
        </div>
      )}
    </>
  );
};

export const EditableApproverGroupCards = (props: Props): JSX.Element => {

  const { editingApproverGroups } = props;

  const editingApproverGroupsLength = editingApproverGroups.length;

  const isLastApproverGroup = useCallback(groupIndex => editingApproverGroupsLength - 1 === groupIndex, [editingApproverGroupsLength]);

  return (
    <>
      {editingApproverGroups?.map((data, index) => (
        <EditableApproverGroupCard
          key={data.uuidForRenderList}
          groupIndex={index}
          {...props}
          isLastApproverGroup={isLastApproverGroup(index)}
        />
      ))}
    </>
  );
};
