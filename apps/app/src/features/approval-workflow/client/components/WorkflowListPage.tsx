import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import { ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import { IWorkflow } from '../../interfaces/workflow';


type Props = {
  workflows: IWorkflow[]
  onClickCreateWorkflowButton: () => void;
}


export const WorkflowListPage = (props: Props): JSX.Element => {
  const { workflows, onClickCreateWorkflowButton } = props;

  const { t } = useTranslation();

  const createWorkflowButtonClickHandler = useCallback(() => {
    if (onClickCreateWorkflowButton == null) {
      return;
    }

    onClickCreateWorkflowButton();
  }, [onClickCreateWorkflowButton]);

  return (
    <>
      <ModalHeader className="bg-primary">
        {t('approval_workflow.list')}
      </ModalHeader>

      <ModalBody>
        {(workflows.length === 0) && (
          <>{t('approval_workflow.list_not_found')}</>
        )}
      </ModalBody>

      <ModalFooter>
        <button type="button" onClick={createWorkflowButtonClickHandler}>
          {t('approval_workflow.create')}
        </button>
      </ModalFooter>
    </>
  );
};
