import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import { ModalHeader, ModalBody, ModalFooter } from 'reactstrap';


type Props = {
  onClickWorkflowListPageBackButton: () => void;
}


export const CreateWorkflowPage = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const { onClickWorkflowListPageBackButton } = props;

  const workflowListPageBackButtonClickHandler = useCallback(() => {
    if (onClickWorkflowListPageBackButton == null) {
      return;
    }

    onClickWorkflowListPageBackButton();
  }, [onClickWorkflowListPageBackButton]);

  return (
    <>
      <ModalHeader className="bg-primary">
        {t('approval_workflow.create_new')}
      </ModalHeader>

      <ModalBody>
        Body
      </ModalBody>

      <ModalFooter>
        <button type="button">
          {t('approval_workflow.create')}
        </button>

        <button type="button" onClick={workflowListPageBackButtonClickHandler}>
          {t('approval_workflow.back')}
        </button>
      </ModalFooter>
    </>
  );
};
