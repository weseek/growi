import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from './UnstatedUtils';

import PageContainer from '../services/PageContainer';

import ApiErrorMessage from './PageManagement/ApiErrorMessage';

const PutBackPageModal = (props) => {
  const {
    t, isOpen, onClose, pageContainer, path,
  } = props;

  const [errorCode, setErrorCode] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [isPutbackRecursively, setIsPutbackRecursively] = useState(true);

  function changeIsPutbackRecursivelyHandler() {
    setIsPutbackRecursively(!isPutbackRecursively);
  }

  async function putbackPage() {
    setErrorCode(null);
    setErrorMessage(null);

    try {
      const response = await pageContainer.revertRemove(isPutbackRecursively);
      const putbackPagePath = response.page.path;
      window.location.href = encodeURI(putbackPagePath);
    }
    catch (err) {
      setErrorCode(err.code);
      setErrorMessage(err.message);
    }
  }

  async function purbackPageButtonnHandler() {
    putbackPage();
  }

  return (
    <Modal isOpen={isOpen} toggle={onClose} className="grw-create-page">
      <ModalHeader tag="h4" toggle={onClose} className="bg-info text-light">
        <i className="icon-action-undo mr-2" aria-hidden="true"></i> { t('modal_putback.label.Put Back Page') }
      </ModalHeader>
      <ModalBody>
        <div>
          <label htmlFor="">{t('modal_putback.label.Put Back Page')}:</label><br />
          <code>{path}</code>
        </div>
        <div className="custom-control custom-checkbox custom-checkbox-warning">
          <input
            className="custom-control-input"
            id="cbPutBackRecursively"
            type="checkbox"
            checked={isPutbackRecursively}
            onChange={changeIsPutbackRecursivelyHandler}
          />
          <label htmlFor="cbPutBackRecursively" className="custom-control-label">
            { t('modal_putback.label.recursively') }
          </label>
          <p className="form-text text-muted mt-0">
            <code>{ path }</code><br />
            { t('modal_putback.help.recursively') }
          </p>
        </div>
      </ModalBody>
      <ModalFooter>
        <ApiErrorMessage errorCode={errorCode} errorMessage={errorMessage} linkPath={path} />
        <button type="button" className="btn btn-info" onClick={purbackPageButtonnHandler}>
          <i className="icon-action-undo mr-2" aria-hidden="true"></i> { t('Put Back') }
        </button>
      </ModalFooter>
    </Modal>
  );

};

/**
 * Wrapper component for using unstated
 */
const PutBackPageModalWrapper = (props) => {
  return createSubscribedElement(PutBackPageModal, props, [PageContainer]);
};

PutBackPageModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,

  path: PropTypes.string.isRequired,
};


export default withTranslation()(PutBackPageModalWrapper);
