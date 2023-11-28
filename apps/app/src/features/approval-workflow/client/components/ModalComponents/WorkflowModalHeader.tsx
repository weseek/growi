import React from 'react';

import { ModalHeader } from 'reactstrap';

import { useWorkflowModal } from '../../stores/workflow';


type Props = {
  children: React.ReactNode,
  onClickPageBackButton?: () => void,
}

export const WorkflowModalHeader = (props: Props): JSX.Element => {
  const { children, onClickPageBackButton } = props;

  const { close } = useWorkflowModal();

  return (
    <ModalHeader toggle={close}>
      <div className="d-flex align-items-center">
        { onClickPageBackButton != null && (
          <button type="button" className="btn" onClick={onClickPageBackButton}>
            <i className="fa fa-fw fa-chevron-left" aria-hidden="true" />
          </button>
        ) }

        {children}
      </div>
    </ModalHeader>
  );
};
