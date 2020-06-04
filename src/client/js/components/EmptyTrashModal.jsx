import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';
import { createSubscribedElement } from './UnstatedUtils';

import AppContainer from '../services/AppContainer';
import ApiErrorMessage from './PageManagement/ApiErrorMessage';

const EmptyTrashModal = (props) => {
  const {
    t, isOpen, onClose, appContainer,
  } = props;
  const [errorCode, setErrorCode] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  async function emptyTrash() {
    setErrorCode(null);
    setErrorMessage(null);
    try {
      await appContainer.apiv3Delete('/pages/empty-trash');
      window.location.reload();
    }
    catch (err) {
      setErrorCode(err.code);
      setErrorMessage(err.message);
    }
  }

  function emptyButtonHandler() {
    emptyTrash();
  }

  return (
    <Modal isOpen={isOpen} toggle={onClose} className="grw-create-page">
      <ModalHeader tag="h4" toggle={onClose} className="bg-danger text-light">
        { t('modal_empty.empty_the_trash')}
      </ModalHeader>
      <ModalBody>
        { t('modal_empty.notice')}
      </ModalBody>
      <ModalFooter>
        <ApiErrorMessage errorCode={errorCode} errorMessage={errorMessage} />
        <button type="button" className="btn btn-danger" onClick={emptyButtonHandler}>
          <i className="icon-trash mr-2" aria-hidden="true"></i> Empty
        </button>
      </ModalFooter>
    </Modal>
  );
};

/**
 * Wrapper component for using unstated
 */
const EmptyTrashModalWrapper = (props) => {
  return createSubscribedElement(EmptyTrashModal, props, [AppContainer]);
};


EmptyTrashModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withTranslation()(EmptyTrashModalWrapper);
