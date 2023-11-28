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
          <button type="button" className="btn d-flex justify-content-center p-0 me-3" onClick={onClickPageBackButton}>
            <span className="fs-1 material-symbols-outlined" aria-hidden="true">chevron_left</span>
          </button>
        ) }

        {children}
      </div>
    </ModalHeader>
  );
};
