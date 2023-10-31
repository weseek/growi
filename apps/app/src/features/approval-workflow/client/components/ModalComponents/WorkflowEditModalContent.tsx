import React, { useState, useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import { ModalBody, ModalFooter } from 'reactstrap';

import { IWorkflowHasId } from '~/features/approval-workflow/interfaces/workflow';

import { useEditingApproverGroups } from '../../services/workflow';
import { useSWRxWorkflow } from '../../stores/workflow';

import { WorkflowModalHeader } from './WorkflowModalHeader';

type Props = {
  workflow?: IWorkflowHasId
  onUpdated: () => void
  onClickWorkflowDetailPageBackButton: () => void
}

export const WorkflowEditModalContent = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const { workflow, onUpdated, onClickWorkflowDetailPageBackButton } = props;

  const { editingApproverGroups } = useEditingApproverGroups(workflow?.approverGroups);

  const [editingWorkflowName, setEditingWorkflowName] = useState<string | undefined>();
  const [editingWorkflowDescription, setEditingWorkflowDescription] = useState<string | undefined>();

  const { update: updateWorkflow } = useSWRxWorkflow(workflow?._id);

  const clickSaveWorkflowButtonClickHandler = useCallback(async() => {
    try {
      await updateWorkflow(editingWorkflowName, editingWorkflowDescription, undefined, undefined);

      if (onUpdated != null) {
        onUpdated();
      }
    }
    catch (err) {
      //
    }
  }, [editingWorkflowDescription, editingWorkflowName, onUpdated, updateWorkflow]);


  if (workflow == null) {
    return <></>;
  }

  return (
    <>
      <WorkflowModalHeader
        title={t('approval_workflow.edit_workflow')}
        onClickPageBackButton={onClickWorkflowDetailPageBackButton}
      />

      <ModalBody>
        Edit Page
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
