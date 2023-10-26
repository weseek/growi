import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import { WorkflowApprovalType, IWorkflowApproverGroupReqForRenderList } from '../../../interfaces/workflow';

import { SearchUserTypeahead } from './SearchUserTypeahead';

const getAllApproverIds = (approverGroups: IWorkflowApproverGroupReqForRenderList[]): string[] => {
  const userIds: string[] = [];
  approverGroups.forEach((group) => {
    const ids = group.approvers.map(u => u.user.toString());
    userIds.push(...ids);
  });
  return userIds;
};

type Props = {
  creatorId: string
  editingApproverGroups: IWorkflowApproverGroupReqForRenderList[]
  onUpdateApproverGroups?: (groupIndex: number, updateApproverGroupData: IWorkflowApproverGroupReqForRenderList) => void
  onClickAddApproverGroupCard?: (groupIndex: number) => void
  onClickRemoveApproverGroupCard?: (groupIndex: number) => void
}

const ApproverGroupCard = (props: Props & { groupIndex: number }): JSX.Element => {
  const {
    creatorId, groupIndex, editingApproverGroups, onUpdateApproverGroups, onClickAddApproverGroupCard, onClickRemoveApproverGroupCard,
  } = props;

  const { t } = useTranslation();

  const editingApproverGroup = editingApproverGroups?.[groupIndex];
  const editingApprovalType = editingApproverGroup.approvalType ?? WorkflowApprovalType.AND;

  const excludedSearchUserIds = [creatorId, ...getAllApproverIds(editingApproverGroups)];

  const changeApprovalTypeButtonClickHandler = useCallback((approvalType: WorkflowApprovalType) => {
    const clonedApproverGroup = { ...editingApproverGroup };
    clonedApproverGroup.approvalType = approvalType;

    if (onUpdateApproverGroups != null) {
      onUpdateApproverGroups(groupIndex, clonedApproverGroup);
    }
  }, [editingApproverGroup, groupIndex, onUpdateApproverGroups]);

  const updateApproversHandler = useCallback((userIds?: string[]) => {
    const clonedApproverGroup = { ...editingApproverGroup };
    const approvers = userIds != null ? userIds.map(userId => ({ user: userId })) : [];
    clonedApproverGroup.approvers = approvers;

    if (onUpdateApproverGroups != null) {
      onUpdateApproverGroups(groupIndex, clonedApproverGroup);
    }
  }, [editingApproverGroup, groupIndex, onUpdateApproverGroups]);

  const isDeletebleEditingApproverGroup = editingApproverGroups.length > 1;

  const isCreatableEditingApproverGroup = editingApproverGroup.approvers.length > 0;

  const isApprovalTypeAnd = editingApprovalType === WorkflowApprovalType.AND;

  return (
    <>
      {onClickAddApproverGroupCard != null && groupIndex === 0 && isCreatableEditingApproverGroup && (
        <div className="text-center my-2">
          <button type="button" onClick={() => onClickAddApproverGroupCard(Math.max(0, groupIndex - 1))}>{t('approval_workflow.add_flow')}</button>
        </div>
      )}

      <div className="card rounded">
        <div className="card-body">

          <div className="d-flex justify-content-center align-items-center">
            <SearchUserTypeahead excludedSearchUserIds={excludedSearchUserIds} onChange={updateApproversHandler} />

            { isDeletebleEditingApproverGroup && onClickRemoveApproverGroupCard != null && (
              <button type="button" className="btn-close" aria-label="Close" onClick={() => { onClickRemoveApproverGroupCard(groupIndex) }}></button>
            )}
          </div>

          <div className="d-flex justify-content-center align-items-center mt-3">

            <span className="text-muted">
              {t('approval_workflow.completion_conditions')}
            </span>

            <div className="dropdown">
              <a className="btn btn-light btn-sm rounded-pill dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                {t(`approval_workflow.approval_type.${editingApprovalType}`)}
              </a>
              <ul
                className="dropdown-menu"
                onClick={() => changeApprovalTypeButtonClickHandler(isApprovalTypeAnd ? WorkflowApprovalType.OR : WorkflowApprovalType.AND)}
              >
                { isApprovalTypeAnd
                  ? <>{t('approval_workflow.approval_type.OR')}</>
                  : <>{t('approval_workflow.approval_type.AND')}</>
                }
              </ul>
            </div>

          </div>
        </div>
      </div>

      {onClickAddApproverGroupCard != null && isCreatableEditingApproverGroup && (
        <div className="text-center my-2">
          <button type="button" onClick={() => onClickAddApproverGroupCard(Math.max(0, groupIndex + 1))}>{t('approval_workflow.add_flow')}</button>
        </div>
      )}
    </>
  );
};

export const ApproverGroupCards = (props: Props): JSX.Element => {
  return (
    <>
      {props.editingApproverGroups?.map((data, index) => (
        <ApproverGroupCard
          key={data.uuidForRenderList}
          groupIndex={index}
          {...props}
        />
      ))}
    </>
  );
};
