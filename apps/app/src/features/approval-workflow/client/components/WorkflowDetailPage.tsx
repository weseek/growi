// TODO: https://redmine.weseek.co.jp/issues/130337
import React from 'react';

import { useTranslation } from 'next-i18next';
import { ModalBody, ModalFooter } from 'reactstrap';

import { IWorkflowHasId } from '../../interfaces/workflow';

import { WorkflowModalHeader } from './WorkflowModalHeader';


type Props = {
  workflow?: IWorkflowHasId,
  onClickWorkflowListPageBackButton: () => void,
}

export const WorkflowDetailPage = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const { workflow, onClickWorkflowListPageBackButton } = props;

  if (workflow == null) {
    return <></>;
  }

  return (
    <>
      <WorkflowModalHeader
        title={workflow.name ?? ''}
        onClickPageBackButton={onClickWorkflowListPageBackButton}
      />

      <ModalBody>
        詳細ページ
      </ModalBody>

      <ModalFooter>
      </ModalFooter>
    </>
  );
};
