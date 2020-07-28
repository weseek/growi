
import React from 'react';
import PropTypes from 'prop-types';

import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import { withTranslation } from 'react-i18next';

import AppContainer from '../services/AppContainer';
import NavigationContainer from '../services/NavigationContainer';
import { withUnstatedContainers } from './UnstatedUtils';

const TopOfTableContentsModal = (props) => {
  // const { t, navigationContainer } = props; tは後ほど入れる

  return (
    <Modal size="lg" className="grw-create-page">
      <ModalHeader tag="h4" className="bg-primary text-light">
        TopOfTableContentsModal
      </ModalHeader>
      <ModalBody>
      </ModalBody>
    </Modal>

  );
};


/**
 * Wrapper component for using unstated
 */
const ModalControlWrapper = withUnstatedContainers(TopOfTableContentsModal, [AppContainer, NavigationContainer]);


TopOfTableContentsModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};

export default withTranslation()(ModalControlWrapper);
