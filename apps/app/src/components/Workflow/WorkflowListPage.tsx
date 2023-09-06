import React from 'react';

import { useTranslation } from 'next-i18next';
import { ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

export const WorkflowListPage = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <>
      <ModalHeader className="bg-primary">
        {t('approval_workflow.list')}
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
