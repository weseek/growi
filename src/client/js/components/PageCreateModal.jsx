
import React from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from './UnstatedUtils';
import AppContainer from '../services/AppContainer';

const PageCreateModal = (props) => {
  const { t, appContainer } = props;

  return (
    <Modal isOpen={appContainer.state.isPageCreateModalShown} toggle={appContainer.closePageCreateModal}>
      <ModalHeader tag="h4" toggle={appContainer.closePageCreateModal} className="bg-primary text-light">
        <span className="text-white">{ t('New Page') }</span>
      </ModalHeader>
      <ModalBody>
        hoge
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
  return createSubscribedElement(PageCreateModal, props, [AppContainer]);
};


PageCreateModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(ModalControlWrapper);
