import React from 'react';
import PropTypes from 'prop-types';

import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import { withTrasnlation } from 'react-i18next';

import { createSubscribedElement } from '../UnstatedUtils';

import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';

const PutBackPageModal = (props) => {
  const { t, appContainer } = props;

  return (
    <Modal size="lg" isOpen toggle={appContainer.closePutBackPageModal} className="grw-create-page">
      <ModalHeader tag="h4" toggle={appContainer.closePutBackPageModal} className="bg-primary text-light">
        { t('Put Back') }
      </ModalHeader>
      <ModalBody>
        Hi threre!
      </ModalBody>
    </Modal>
  );

};


const PutbackPageModalWrapper = (props) => {
  return createSubscribedElement(PutBackPageModal, props, [AppContainer, PageContainer]);
};

PutBackPageModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTrasnlation()(PutbackPageModalWrapper);
