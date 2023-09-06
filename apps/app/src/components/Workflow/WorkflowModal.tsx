import React, { useState } from 'react';

import { Modal } from 'reactstrap';

import { useWorkflowModal } from '~/stores/modal';

import { CreateWorkflowPage } from './CreateWorkflowPage';
import { WorkflowListPage } from './WorkflowListPage';


export const PageType = {
  list: 'LIST',
  create: 'CREATE',
} as const;

type PageType = typeof PageType[keyof typeof PageType];


const WorkflowModal = (): JSX.Element => {
  const [pageType, setPageType] = useState<PageType>(PageType.list);

  const { data: workflowModalData, close: closeWorkflowModal } = useWorkflowModal();

  return (
    <Modal isOpen={workflowModalData?.isOpened ?? false} toggle={() => closeWorkflowModal()}>
      { pageType === PageType.list && (
        <WorkflowListPage />
      )}

      { pageType === PageType.create && (
        <CreateWorkflowPage />
      )}
    </Modal>
  );
};

export default WorkflowModal;
