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

  const isExistApprover = useCallback(() => {
    if (workflow == null || currentUser == null) {
      return false;
    }

    for (const approverGroup of workflow.approverGroups) {
      for (const approver of approverGroup.approvers) {
        if (approver.user._id === currentUser._id) {
          return true;
        }
      }
    }

    return false;
  }, [currentUser, workflow]);

  const isAbleEditButton = workflow?.status === WorkflowStatus.INPROGRESS && (currentUser?.admin || isExistApprover());
  const isAbleApproveButton = workflow?.status === WorkflowStatus.INPROGRESS && isExistApprover();

  const approveButtonClickHandler = useCallback(async() => {
    try {
      await updateApproverStatus(WorkflowApproverStatus.APPROVE);
    }
    catch (err) {
      // TODO: Consider how to display errors
    }
  }, [updateApproverStatus]);

  if (workflow == null) {
    return <></>;
  }

  return (
    <>
      <WorkflowModalHeader
        title={workflow?.name ?? ''}
        onClickPageBackButton={onClickWorkflowListPageBackButton}
      />

      <ModalBody>
        <button type="button" disabled={!isAbleEditButton} onClick={onClickWorkflowEditButton}>{t('approval_workflow.edit')}</button>
        <ApproverGroupCards workflow={workflow} />
      </ModalBody>

      <ModalFooter>
        <button type="button" disabled={!isAbleApproveButton} onClick={approveButtonClickHandler}>{t('approval_workflow.approver_status.APPROVE')}</button>
      </ModalFooter>
    </>
  );
};
