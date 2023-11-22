import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import { ModalBody, ModalFooter } from 'reactstrap';

import { useCurrentUser } from '~/stores/context';

import {
  type IWorkflowHasId,
  WorkflowStatus,
  WorkflowApproverStatus,
} from '../../../interfaces/workflow';
import { useSWRxWorkflow } from '../../stores/workflow';

import { ApproverGroupCards } from './ApproverGroupCards';
import { WorkflowModalHeader } from './WorkflowModalHeader';


type Props = {
  workflow?: IWorkflowHasId,
  onClickWorkflowEditButton: () => void,
  onClickWorkflowListPageBackButton: () => void,
}

export const WorkflowDetailModalContent = (props: Props): JSX.Element => {
  const { workflow, onClickWorkflowEditButton, onClickWorkflowListPageBackButton } = props;

  const { t } = useTranslation();

  const { data: currentUser } = useCurrentUser();
  const { updateApproverStatus } = useSWRxWorkflow(workflow?._id);

  const findApprover = useCallback(() => {
    if (workflow == null || currentUser == null) {
      return;
    }

    for (const approverGroup of workflow.approverGroups) {
      for (const approver of approverGroup.approvers) {
        if (approver.user._id === currentUser._id) {
          return approver;
        }
      }
    }
  }, [currentUser, workflow]);

  const approver = findApprover();
  const isAbleEditButton = workflow?.status === WorkflowStatus.INPROGRESS && (currentUser?.admin || approver != null);
  const isAbleApproveButton = workflow?.status === WorkflowStatus.INPROGRESS && approver != null && approver.status === WorkflowApproverStatus.NONE;

  const approveButtonClickHandler = useCallback(async() => {
    try {
      await updateApproverStatus(WorkflowApproverStatus.APPROVE);
    }
    catch (err) {
      // TODO: Consider how to display errors
    }
  }, [updateApproverStatus]);

  const getBadgeColor = useCallback(() => {
    switch (workflow?.status) {
      case WorkflowStatus.INPROGRESS:
        return 'text-bg-primary';
      case WorkflowStatus.APPROVE:
        return 'text-bg-success';
      default:
        return '';
    }
  }, [workflow?.status]);

  if (workflow == null) {
    return <></>;
  }

  return (
    <>
      <WorkflowModalHeader onClickPageBackButton={onClickWorkflowListPageBackButton}>
        <span className={`badge rounded-pill ${getBadgeColor()}`}>{t(`approval_workflow.workflow_status.${workflow.status}`)}</span>
        <span className="fw-bold">{workflow.name}</span>
      </WorkflowModalHeader>

      <ModalBody>
        <button type="button" disabled={!isAbleEditButton} onClick={onClickWorkflowEditButton}>{t('approval_workflow.edit')}</button>
        <ApproverGroupCards workflow={workflow} />
        <div className="mt-4 text-center">{t(`approval_workflow.detail_modal_content_message.${workflow.status}`)}</div>
      </ModalBody>

      <ModalFooter>
        <button type="button" disabled={!isAbleApproveButton} onClick={approveButtonClickHandler}>{t('approval_workflow.approver_status.APPROVE')}</button>
      </ModalFooter>
    </>
  );
};
