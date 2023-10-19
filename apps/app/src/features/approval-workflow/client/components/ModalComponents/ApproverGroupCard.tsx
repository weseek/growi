import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import { WorkflowApprovalType, IWorkflowApproverGroupReq } from '../../../interfaces/workflow';

type Props = {
  creatorId?: string
  groupIndex: number
  editingApproverGroups: IWorkflowApproverGroupReq[]
  onUpdateApproverGroups?: (groupIndex: number, updateApproverGroupData: IWorkflowApproverGroupReq) => void
  onClickAddApproverGroupCard?: (groupIndex: number) => void
}

export const ApproverGroupCard = (props: Props): JSX.Element => {
  const {
    creatorId, groupIndex, editingApproverGroups, onUpdateApproverGroups, onClickAddApproverGroupCard,
  } = props;

  const { t } = useTranslation();

  const editingApproverGroup = editingApproverGroups?.[groupIndex];
  const editingApprovalType = editingApproverGroup.approvalType ?? WorkflowApprovalType.AND;
  const editingApprovers = editingApproverGroup.approvers?.map(v => v.user.toString()) ?? [];
  const excludedSearchUserId = [creatorId, ...editingApprovers];

  const changeApprovalTypeButtonClickHandler = useCallback((approvalType: WorkflowApprovalType) => {
    const clonedApproverGroup = { ...editingApproverGroup };
    clonedApproverGroup.approvalType = approvalType;

    if (onUpdateApproverGroups != null) {
      onUpdateApproverGroups(groupIndex, clonedApproverGroup);
    }
  }, [editingApproverGroup, groupIndex, onUpdateApproverGroups]);

  const updateApproversHandler = useCallback((userIds: string[]) => {
    const clonedApproverGroup = { ...editingApproverGroup };
    const approvers = userIds.map(userId => ({ user: userId }));
    clonedApproverGroup.approvers = approvers;

    if (onUpdateApproverGroups != null) {
      onUpdateApproverGroups(groupIndex, clonedApproverGroup);
    }
  }, [editingApproverGroup, groupIndex, onUpdateApproverGroups]);

  const isApprovalTypeAnd = editingApprovalType === WorkflowApprovalType.AND;


  return (
    <div className="mt-4">
      {onClickAddApproverGroupCard != null && (
        <div className="text-center mt-2">
          <button type="button" onClick={() => onClickAddApproverGroupCard(Math.max(0, groupIndex - 1))}>フローを追加</button>
        </div>
      )}

      <div className="card rounded">
        <div className="card-body">
          <div className="text-muted">
            <i className="fa fa-user" />
          </div>

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

          完了条件
        </div>
      </div>

      {onClickAddApproverGroupCard != null && (
        <div className="text-center mt-2">
          <button type="button" onClick={() => onClickAddApproverGroupCard(Math.max(0, groupIndex + 1))}>フローを追加</button>
        </div>
      )}
    </div>
  );
};
