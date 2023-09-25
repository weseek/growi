import React, { useCallback } from 'react';

import { ModalHeader } from 'reactstrap';


type Props = {
  title: string
  onClickPageBackButton: () => void,
}

export const WorkflowModalHeader = (props: Props): JSX.Element => {
  const { title, onClickPageBackButton } = props;

  const pageBackbuttonClickHandler = useCallback(() => {
    if (onClickPageBackButton == null) {
      return;
    }

    onClickPageBackButton();
  }, [onClickPageBackButton]);

  return (
    <ModalHeader className="bg-primary">
      <button type="button" className="btn" onClick={() => pageBackbuttonClickHandler()}>
        <i className="fa fa-fw fa-chevron-left" aria-hidden="true"></i>
      </button>
      { title }
    </ModalHeader>
  );
};
