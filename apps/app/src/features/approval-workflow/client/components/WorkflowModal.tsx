import React, { useState, useCallback } from 'react';

import { Modal } from 'reactstrap';

import { useWorkflowModal, useSWRxWorkflow, useSWRxWorkflowList } from '../stores/workflow';

import { WorkflowListModalContent, WorkflowCreationModalContent, WorkflowDetailModalContent } from './ModalComponents';

const PageType = {
  list: 'LIST',
  creation: 'CREATION',
  detail: 'DETAIL',
} as const;

type PageType = typeof PageType[keyof typeof PageType];


const WorkflowModal = (): JSX.Element => {
  const [pageType, setPageType] = useState<PageType>(PageType.list);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | undefined>();

  const { data: workflowModalData, close: closeWorkflowModal } = useWorkflowModal();
  // TODO: https://redmine.weseek.co.jp/issues/130992
  const { data: workflowPaginateResult, mutate: mutateWorkflows } = useSWRxWorkflowList(workflowModalData?.pageId, 1, 0);
  const { data: selectedWorkflow } = useSWRxWorkflow(selectedWorkflowId);

  /*
  * for WorkflowListPage
  */
  const createWorkflowButtonClickHandler = useCallback(() => {
    setPageType(PageType.creation);
  }, []);

  const showWorkflowDetailButtonClickHandler = useCallback((workflowId: string) => {
    setSelectedWorkflowId(workflowId);
    setPageType(PageType.detail);
  }, []);

  /*
  * for CreateWorkflowPage
  */
  const onCreatedHandler = useCallback(async() => {
    await mutateWorkflows();
    setPageType(PageType.list);
  }, [mutateWorkflows]);

  const workflowListPageBackButtonClickHandler = useCallback(() => {
    setPageType(PageType.list);
  }, []);


  if (workflowModalData?.pageId == null) {
    return <></>;
  }

  return (
    <Modal isOpen={workflowModalData?.isOpened ?? false} toggle={() => closeWorkflowModal()}>
      { pageType === PageType.list && (
        <WorkflowListModalContent
          workflows={workflowPaginateResult?.docs ?? []}
          onDeleted={mutateWorkflows}
          onClickCreateWorkflowButton={createWorkflowButtonClickHandler}
          onClickShowWorkflowDetailButton={showWorkflowDetailButtonClickHandler}
        />
      )}

      { pageType === PageType.creation && (
        <WorkflowCreationModalContent
          pageId={workflowModalData.pageId}
          onCreated={onCreatedHandler}
          onClickWorkflowListPageBackButton={workflowListPageBackButtonClickHandler}
        />
      )}

      { pageType === PageType.detail && (
        <WorkflowDetailModalContent
          workflow={selectedWorkflow}
          onClickWorkflowListPageBackButton={workflowListPageBackButtonClickHandler}
        />
      )}
    </Modal>
  );
};

export default WorkflowModal;
