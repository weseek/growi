
import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/es/Modal';

const AssociateModal = (props) => {
  return (
    <Modal show={props.isOpen} onHide={props.onClose}>
      <Modal.Header closeButton>
        <Modal.Title></Modal.Title>
      </Modal.Header>
      <Modal.Body>
          hoge
      </Modal.Body>

      <Modal.Footer>
      </Modal.Footer>
    </Modal>
  );
};

AssociateModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};


export default AssociateModal;
