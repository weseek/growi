import React from 'react';

import { useTranslation } from 'next-i18next';
import { ModalHeader, ModalBody, ModalFooter } from 'reactstrap';


export const CreateWorkflowPage = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <>
      <ModalHeader className="bg-primary">
        {t('approval_workflow.create')}
      </ModalHeader>

      <ModalBody>
        Body
      </ModalBody>

      <ModalFooter>
        Footer
      </ModalFooter>
    </>
  );
};
