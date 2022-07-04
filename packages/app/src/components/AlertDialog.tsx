import React from 'react';

import {
  Modal, ModalBody, ModalFooter,
} from 'reactstrap';


type Props = {
  title: string,
  message: string,
  isOpen: boolean,
  onClose: () => void,
}


export const AlertDialog = (props: Props): JSX.Element => {
  function handleSubmit() {
    props.onClose();
  }

  return (
    <Modal isOpen={props.isOpen} toggle={props.onClose} id="edit-tag-modal" autoFocus={false}>
      <ModalBody>
        <h2>
          {props.title}
        </h2>
        <h4>
          {props.message}
        </h4>
      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-primary" onClick={props.onClose}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={handleSubmit}>
          Done
        </button>
      </ModalFooter>
    </Modal>
  );
};
