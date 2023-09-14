import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import { ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import { useSWRxWorkflowList } from '~/stores/workflow';


type Props = {
  pageId: string,
  onClickCreateWorkflowButton: () => void;
}


export const WorkflowListPage = (props: Props): JSX.Element => {
  const { pageId, onClickCreateWorkflowButton } = props;

  const { t } = useTranslation();

  const { data: workflows } = useSWRxWorkflowList(pageId);

  console.log('workflows', workflows);

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
        Body
      </ModalBody>

      <ModalFooter>
        <button type="button" onClick={createWorkflowButtonClickHandler}>
          {t('approval_workflow.create')}
        </button>
      </ModalFooter>
    </>
  );
};
