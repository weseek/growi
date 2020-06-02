import React from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from './UnstatedUtils';


const OutsideShareLinkModal = (props) => {

  const { t } = props;


  return (
    <Modal size="lg" isOpen={props.isOpen} toggle={props.onClose} className="grw-create-page">
      <ModalHeader tag="h4" toggle={props.onClose} className="bg-primary text-light">Hi there!
        { t('New Page') }
      </ModalHeader>
      <ModalBody>
        <h1>Hi there</h1>
      </ModalBody>
      <ModalFooter>
      </ModalFooter>
    </Modal>
  );
};

/**
 * Wrapper component for using unstated
 */
const ModalControlWrapper = (props) => {
  return createSubscribedElement(OutsideShareLinkModal, props);
};


OutsideShareLinkModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withTranslation()(ModalControlWrapper);
