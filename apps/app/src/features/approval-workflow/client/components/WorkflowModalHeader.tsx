import React, { useCallback } from 'react';

import { ModalHeader } from 'reactstrap';


type Props = {
  title: string
  onClickBackButton: () => void,
}

export const WorkflowModalHeader = (props: Props): JSX.Element => {
  const { title, onClickBackButton } = props;

  const backbuttonClickHandler = useCallback(() => {
    if (onClickBackButton == null) {
      return;
    }

    onClickBackButton();
  }, [onClickBackButton]);

  return (
    <ModalHeader className="bg-primary">
      <button type="button" className="btn" onClick={() => backbuttonClickHandler()}>
        <i className="fa fa-fw fa-chevron-left" aria-hidden="true"></i>
      </button>
      { title }
    </ModalHeader>
  );
};
