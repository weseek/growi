import React from 'react';

import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';


export type DeletePluginModalProps = {
  isShown: boolean,
  cancelToDelete: () => void,
  confirmToDelete: () => void,
}

export const DeletePluginModal = (props: DeletePluginModalProps): JSX.Element => {
  const {
    isShown, cancelToDelete, confirmToDelete,
  } = props;

  const headerContent = () => {
    if (isShown === false) {
      return <></>;
    }
    return (
      <span>
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
        <p className="card well mt-2 p-2">本当に削除しますか？</p>
      </>
    );
  };

  const footerContent = () => {
    if (isShown === false) {
      return <></>;
    }
    return (
      <>
        <Button onClick={cancelToDelete}>Cancel</Button>
        <Button color="danger" onClick={confirmToDelete}>
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
