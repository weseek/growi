
import React from 'react';
import PropTypes from 'prop-types';

import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import { withTranslation } from 'react-i18next';

import AppContainer from '../services/AppContainer';
import NavigationContainer from '../services/NavigationContainer';
import { withUnstatedContainers } from './UnstatedUtils';

const PageCreateModal = (props) => {
  const { t, navigationContainer } = props;

  return (
    <Modal size="lg" isOpen={navigationContainer.state.isPageCreateModalShown} toggle={navigationContainer.closePageCreateModal} className="grw-create-page">
      <ModalHeader tag="h4" toggle={navigationContainer.closePageCreateModal} className="bg-primary text-light">
        { t('New Page') }
      </ModalHeader>
      <ModalBody>
      </ModalBody>
    </Modal>

  );
};


/**
 * Wrapper component for using unstated
 */
const ModalControlWrapper = withUnstatedContainers(PageCreateModal, [AppContainer, NavigationContainer]);


PageCreateModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};

export default withTranslation()(ModalControlWrapper);
