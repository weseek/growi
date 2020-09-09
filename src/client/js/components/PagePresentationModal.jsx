import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal, ModalBody,
} from 'reactstrap';

const PagePresentationModal = (props) => {
  return (
    <Modal isOpen={props.isOpen} toggle={props.onClose} className="grw-presentation-page" unmountOnClose={false}>
      <ModalBody className="presentation-body">
        <iframe src={props.href} />
      </ModalBody>
    </Modal>
  );
};
PagePresentationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  href: PropTypes.string.isRequired,
};


export default PagePresentationModal;
