import React from 'react';

import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';


export type DeletePluginModalProps = {
  isShown: boolean,
  errorMessage: string,
  cancelToDelete: () => void,
  confirmToDelete: () => void,
}

export const DeletePluginModal = (props: DeletePluginModalProps): JSX.Element => {
  const {
    isShown, errorMessage, cancelToDelete, confirmToDelete,
  } = props;

  const headerContent = () => {
    if (isShown === false) {
      return <></>;
    }
    return (
      <span>
        <i className="icon-fw icon-fire"></i>
        Delete plugin?
      </span>
    );
  };

  const bodyContent = () => {
    if (isShown === false) {
      return <></>;
    }

    return (
      <>
        <p className="card well comment-body mt-2 p-2">本当に削除しますか？</p>
      </>
    );
  };

  const footerContent = () => {
    if (isShown === false) {
      return <></>;
    }
    return (
      <>
        <span className="text-danger">{errorMessage}</span>&nbsp;
        <Button onClick={cancelToDelete}>Cancel</Button>
        <Button color="danger" onClick={confirmToDelete}>
          <i className="icon icon-fire"></i>
          Delete
        </Button>
      </>
    );
  };

  return (
    <Modal isOpen={isShown} toggle={cancelToDelete}>
      <ModalHeader tag="h4" toggle={cancelToDelete} className="bg-danger text-light">
        {headerContent()}
      </ModalHeader>
      <ModalBody>
        {bodyContent()}
      </ModalBody>
      <ModalFooter>
        {footerContent()}
      </ModalFooter>
    </Modal>
  );
};
