import React from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';

const EmptyTrashModal = (props) => {
  const {
    t, isOpen, onClose, onClickSubmit,
  } = props;

  return (
    <Modal isOpen={isOpen} toggle={onClose} className="grw-create-page">
      <ModalHeader tag="h4" toggle={onClose} className="bg-danger text-light">
        { t('modal_empty.empty_the_trash')}
      </ModalHeader>
      <ModalBody>
        { t('modal_empty.notice')}
      </ModalBody>
      <ModalFooter>
        {/* TODO add error message */}
        <button type="button" className="btn btn-danger" onClick={onClickSubmit}>
          <i className="icon-trash mr-2" aria-hidden="true"></i>Empty
        </button>
      </ModalFooter>
    </Modal>
  );
};


EmptyTrashModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onClickSubmit: PropTypes.func.isRequired,
};

export default withTranslation()(EmptyTrashModal);
