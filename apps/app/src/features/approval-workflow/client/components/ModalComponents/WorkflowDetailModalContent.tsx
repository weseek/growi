// TODO: https://redmine.weseek.co.jp/issues/130337
import React from 'react';

import { useTranslation } from 'next-i18next';
import { ModalBody, ModalFooter } from 'reactstrap';

import { IWorkflowHasId } from '../../../interfaces/workflow';

import { WorkflowModalHeader } from './WorkflowModalHeader';


type Props = {
  workflow?: IWorkflowHasId,
  onClickWorkflowEditButton: () => void,
  onClickWorkflowListPageBackButton: () => void,
}

export const WorkflowDetailModalContent = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const { workflow, onClickWorkflowEditButton, onClickWorkflowListPageBackButton } = props;

  return (
    <>
      <WorkflowModalHeader
        title={workflow?.name ?? ''}
        onClickPageBackButton={onClickWorkflowListPageBackButton}
      />

      <ModalBody>
        <button type="button" onClick={() => { onClickWorkflowEditButton() }}>{t('approval_workflow.edit')}</button>
        詳細ページ
      </ModalBody>

      <ModalFooter>
      </ModalFooter>
    </>
  );
};
