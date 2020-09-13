import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal, ModalBody,
} from 'reactstrap';

const PagePresentationModal = (props) => {

  function closeModalHandler() {
    if (props.onClose === null) {
      return;
    }
    props.onClose();
  }

  return (
    <Modal isOpen={props.isOpen} toggle={closeModalHandler} className="grw-presentation-modal" unmountOnClose={false}>
      <ModalBody className="modal-body">
        <iframe src={props.href} />
      </ModalBody>
    </Modal>
  );
};
PagePresentationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  href: PropTypes.string.isRequired,
};


export default PagePresentationModal;
