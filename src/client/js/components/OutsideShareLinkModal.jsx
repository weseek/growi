import React from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from './UnstatedUtils';

const OutsideShareLinkModal = (props) => {

  return (
    <Modal size="lg" className="grw-create-page">
      <ModalHeader tag="h4" className="bg-primary text-light">
      </ModalHeader>
      <ModalBody>
      </ModalBody>
      <ModalFooter>
      </ModalFooter>
    </Modal>
  );
};

/**
 * Wrapper component for using unstated
 */
const OutsideShareLinkModalWrapper = (props) => {
  return createSubscribedElement(OutsideShareLinkModal, [props]);
};


OutsideShareLinkModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
};

export default withTranslation()(OutsideShareLinkModalWrapper);
