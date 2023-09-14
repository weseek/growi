import React, { useState, useCallback } from 'react';

import { Modal } from 'reactstrap';

import { useWorkflowModal } from '~/stores/modal';

import { CreateWorkflowPage } from './CreateWorkflowPage';
import { WorkflowListPage } from './WorkflowListPage';


const PageType = {
  list: 'LIST',
  create: 'CREATE',
} as const;

type PageType = typeof PageType[keyof typeof PageType];


const WorkflowModal = (): JSX.Element => {
  const [pageType, setPageType] = useState<PageType>(PageType.list);

  const { data: workflowModalData, close: closeWorkflowModal } = useWorkflowModal();

  /*
  * for WorkflowListPage
  */
  const createWorkflowButtonClickHandler = useCallback(() => {
    setPageType(PageType.create);
  }, []);

  /*
  * for CreateWorkflowPage
  */
  const workflowListPageBackButtonClickHandler = useCallback(() => {
    setPageType(PageType.list);
  }, []);

  if (workflowModalData?.pageId == null) {
    return <></>;
  }

  return (
    <Modal isOpen={workflowModalData?.isOpened ?? false} toggle={() => closeWorkflowModal()}>
      { pageType === PageType.list && (
        <WorkflowListPage
          pageId={workflowModalData.pageId}
          onClickCreateWorkflowButton={createWorkflowButtonClickHandler}
        />
      )}

      { pageType === PageType.create && (
        <CreateWorkflowPage
          pageId={workflowModalData.pageId}
          onClickWorkflowListPageBackButton={workflowListPageBackButtonClickHandler}
        />
      )}
    </Modal>
  );
};

export default WorkflowModal;
