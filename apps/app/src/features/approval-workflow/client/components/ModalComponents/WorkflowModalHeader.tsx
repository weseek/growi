import React from 'react';

import { ModalHeader } from 'reactstrap';


type Props = {
  title?: string
  onClickPageBackButton?: () => void,
}

export const WorkflowModalHeader = (props: Props): JSX.Element => {
  const { title, onClickPageBackButton } = props;

  return (
    <ModalHeader className="bg-primary">
      { onClickPageBackButton != null && (
        <button type="button" className="btn" onClick={onClickPageBackButton}>
          <i className="fa fa-fw fa-chevron-left" aria-hidden="true" />
        </button>
      ) }

      { title }
    </ModalHeader>
  );
};
