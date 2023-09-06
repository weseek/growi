import React from 'react';

import { useTranslation } from 'next-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { useWorkflowModal } from '~/stores/modal';


const WorkflowModal = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: workflowModalData, close: closeWorkflowModal } = useWorkflowModal();

  return (
    <Modal isOpen={workflowModalData?.isOpened ?? false} toggle={() => closeWorkflowModal()}>
      <ModalHeader className="bg-primary text-light">
        {t('approval_workflow.list')}
      </ModalHeader>

      <ModalBody>
        Body
      </ModalBody>

      <ModalFooter>
        Footer
      </ModalFooter>
    </Modal>
  );
};

export default WorkflowModal;
