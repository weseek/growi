import React from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';

const PutBackPageModal = (props) => {
  const {
    t, isOpen, toggle, onClickSubmit,
  } = props;

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="grw-create-page">
      <ModalHeader tag="h4" toggle={toggle} className="bg-info text-light">
        { t('Put Back') }
      </ModalHeader>
      <ModalBody>
        Hi threre!
      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-info" onClick={onClickSubmit}>
          <i className="icon-trash mr-2" aria-hidden="true"></i>{ t('Put Back') }
        </button>
      </ModalFooter>
    </Modal>
  );

};

PutBackPageModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next

  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  onClickSubmit: PropTypes.func.isRequired,
};

export default withTranslation()(PutBackPageModal);
