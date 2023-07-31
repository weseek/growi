import React, { useState } from 'react';

import {
  Modal, ModalHeader, ModalBody, ModalFooter, Button,
} from 'reactstrap';

export const ModalForParentPageSelection = () => {
  const [modal, setModal] = useState(false);

  const toggle = () => setModal(!modal);

  return (
    <>
      <Button color="primary" onClick={toggle}>起動！</Button>
      <Modal isOpen={modal} toggle={toggle} centered="true">
        <ModalHeader toggle={toggle}>Modal Title</ModalHeader>
        <ModalBody>
          明日には明日の風が吹く
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={toggle}>
            Do Something
          </Button>{' '}
          <Button color="secondary" onClick={toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
