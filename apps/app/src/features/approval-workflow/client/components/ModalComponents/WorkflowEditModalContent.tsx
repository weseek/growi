import React from 'react';

import { useTranslation } from 'next-i18next';
import { ModalBody, ModalFooter } from 'reactstrap';


import { WorkflowModalHeader } from './WorkflowModalHeader';

type Props = {
  workflowDetailePageBackButtonClickHandler: () => void
}

export const WorkflowEditModalContent = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const { workflowDetailePageBackButtonClickHandler } = props;

  return (
    <>
      <WorkflowModalHeader
        title={t('approval_workflow.edit_workflow')}
        onClickPageBackButton={workflowDetailePageBackButtonClickHandler}
      />

      <ModalBody>
        Edit Page
      </ModalBody>

      <ModalFooter>
        <button type="button">{t('approval_workflow.cancel')}</button>
        <button type="button">{t('approval_workflow.completion')}</button>
      </ModalFooter>
    </>
  );
};
