// TODO: https://redmine.weseek.co.jp/issues/130336
import React from 'react';

import { useTranslation } from 'next-i18next';
import {
  ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { IWorkflowHasId } from '../../interfaces/workflow';


type Props = {
  workflow?: IWorkflowHasId,
}

export const WorkflowDetailPage = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const { workflow } = props;

  if (workflow == null) {
    return <></>;
  }

  return (
    <>
      <ModalHeader className="bg-primary">
        { workflow.name }
      </ModalHeader>

      <ModalBody>
        詳細ページ
      </ModalBody>

      <ModalFooter>
      </ModalFooter>
    </>
  );
};
