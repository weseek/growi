import React, { useState, useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import { ModalBody, ModalFooter } from 'reactstrap';

import { IWorkflowHasId } from '~/features/approval-workflow/interfaces/workflow';

import { useEditingApproverGroups } from '../../services/workflow';
import { useSWRxWorkflow } from '../../stores/workflow';

import { WorkflowModalHeader } from './WorkflowModalHeader';

type Props = {
  workflow: IWorkflowHasId
  onUpdated?: () => void
  onClickWorkflowDetailPageBackButton: () => void
}

export const WorkflowEditModalContent = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const { workflow, onUpdated, onClickWorkflowDetailPageBackButton } = props;

  const { editingApproverGroups } = useEditingApproverGroups(workflow.approverGroups);

  const [editingWorkflowName, setEditingWorkflowName] = useState<string | undefined>(workflow.name);
  const [editingWorkflowDescription, setEditingWorkflowDescription] = useState<string | undefined>(workflow.comment);

  const { update: updateWorkflow } = useSWRxWorkflow(workflow?._id);

  const clickSaveWorkflowButtonClickHandler = useCallback(async() => {
    try {
      await updateWorkflow(editingWorkflowName, editingWorkflowDescription, undefined, undefined);

      if (onUpdated != null) {
        onUpdated();
      }
    }
    catch (err) {
      // TODO: Consider how to display errors
    }
  }, [editingWorkflowDescription, editingWorkflowName, onUpdated, updateWorkflow]);


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
