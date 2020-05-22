import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from './UnstatedUtils';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

import ApiErrorMessage from './PageManagement/ApiErrorMessage';

const PutBackPageModal = (props) => {
  const {
    t,
    isOpen,
    onClose,
    appContainer,
    pageContainer,
  } = props;

  const {
    pageId, path,
  } = pageContainer.state;

  const [errorCode, setErrorCode] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [isPutbackRecursively, setIsPutbackRecursively] = useState(true);

  function changeIsPutbackRecursivelyHandler() {
    setIsPutbackRecursively(!isPutbackRecursively);
  }

  async function clickPutbackButtonHandler() {
    try {
      setErrorCode(null);
      setErrorMessage(null);
      const res = await appContainer.apiPost('/pages.revertRemove', { page_id: pageId });
      const { page } = res;
      window.location.href = encodeURI(`${page.path}`);
    }
    catch (err) {
      setErrorCode(err.code);
      setErrorMessage(err.message);
    }
  }

  return (
    <Modal isOpen={isOpen} toggle={onClose} className="grw-create-page">
      <ModalHeader tag="h4" toggle={onClose} className="bg-info text-light">
        <i className="icon-action-undo mr-2" aria-hidden="true"></i> { t('Put Back Page') }
      </ModalHeader>
      <ModalBody>
        <div>
          <label htmlFor="">Put back page:</label><br />
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
          <p className="form-text text-muted mt-0"><code>{ path }</code>{ t('modal_putback.help.recursively') }</p>
        </div>
      </ModalBody>
      <ModalFooter>
        <ApiErrorMessage errorCode={errorCode} errorMessage={errorMessage} linkPath={path} />
        <button type="button" className="btn btn-info" onClick={clickPutbackButtonHandler}>
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
  return createSubscribedElement(PutBackPageModal, props, [AppContainer, PageContainer]);
};

PutBackPageModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next

  page: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  onClickSubmit: PropTypes.func.isRequired,
  appContainer: PropTypes.instanceOf(PageContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};


export default withTranslation()(PutBackPageModalWrapper);
