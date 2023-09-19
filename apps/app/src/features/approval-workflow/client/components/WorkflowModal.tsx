import React, { useState, useCallback } from 'react';

import { Modal } from 'reactstrap';

import { useWorkflowModal, useSWRxWorkflowList } from '../stores/workflow';

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
  // TODO: https://redmine.weseek.co.jp/issues/130992
  const { data: workflowPaginateResult, mutate: mutateWorkflows } = useSWRxWorkflowList(workflowModalData?.pageId, 1, 0);

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
          workflows={workflowPaginateResult?.docs ?? []}
          onClickCreateWorkflowButton={createWorkflowButtonClickHandler}
        />
      )}

      { pageType === PageType.create && (
        <CreateWorkflowPage
          pageId={workflowModalData.pageId}
          mutateWorkflows={mutateWorkflows}
          onClickWorkflowListPageBackButton={workflowListPageBackButtonClickHandler}
        />
      )}
    </Modal>
  );
};

export default WorkflowModal;
