import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';
import { createSubscribedElement } from './UnstatedUtils';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';
import ApiErrorMessage from './PageManagement/ApiErrorMessage';

const RenameModal = (props) => {
  const { t, appContainer, pageContainer } = props;
  const {
    path,
    pageId,
    revisionId,
    isRenameRedirect,
    isRenameRecursively,
    isRenameMetadata,
  } = pageContainer.state;
  const { crowi } = appContainer.config;

  const [pageNameInput, setPageNameInput] = useState(path);

  const [errorCode, setErrorCode] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  function onChangeNewPathHandler(value) {
    setPageNameInput(value);
  }

  async function clickRenameButtonHandler() {
    try {
      setErrorCode(null);
      setErrorMessage(null);
      const res = await appContainer.apiPost('/pages.rename', { page_id: pageId, revision_id: revisionId, new_path: pageNameInput });
      const { page } = res;
      window.location.href = encodeURI(`${page.path}?rename=${path}`);
    }
    catch (err) {
      setErrorCode(err.code);
      setErrorMessage(err.message);
    }
  }

  return (
    <Modal isOpen={pageContainer.state.isRenameModalShown} toggle={pageContainer.closeRenameModal}>
      <ModalHeader tag="h4" toggle={appContainer.closeRenameModal} className="bg-primary text-light">
        { t('modal_rename.label.Move/Rename page') }
      </ModalHeader>
      <ModalBody>
        <div className="form-group">
          <label>{ t('modal_rename.label.Current page name') }</label><br />
          <code>{path}</code>
        </div>
        <div className="form-group">
          <label htmlFor="newPageName">{ t('modal_rename.label.New page name') }</label><br />
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">{crowi.url}</span>
            </div>
            <div className="flex-fill">
              <input
                type="text"
                value={pageNameInput}
                className="form-control"
                onChange={e => onChangeNewPathHandler(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
        <div className="custom-control custom-checkbox custom-checkbox-warning">
          <input
            className="custom-control-input"
            name="recursively"
            id="cbRenameRecursively"
            value="1"
            type="checkbox"
            defaultChecked={isRenameRecursively}
          />
          <label className="custom-control-label" htmlFor="cbRenameRecursively">
            { t('modal_rename.label.Recursively') }
            <p className="form-text text-muted mt-0">{ t('modal_rename.help.recursive') }</p>
          </label>
        </div>

        <div className="custom-control custom-checkbox custom-checkbox-success">
          <input
            className="custom-control-input"
            name="create_redirect"
            id="cbRenameRedirect"
            value="1"
            type="checkbox"
            defaultChecked={isRenameRedirect}
          />
          <label className="custom-control-label" htmlFor="cbRenameRedirect">
            { t('modal_rename.label.Redirect') }
            <p className="form-text text-muted mt-0">{ t('modal_rename.help.redirect') }</p>
          </label>
        </div>

        <div className="custom-control custom-checkbox custom-checkbox-primary">
          <input
            className="custom-control-input"
            name="remain_metadata"
            id="cbRenameMetadata"
            value="1"
            type="checkbox"
            defaultChecked={isRenameMetadata}
          />
          <label className="custom-control-label" htmlFor="cbRenameMetadata">
            { t('modal_rename.label.Do not update metadata') }
            <p className="form-text text-muted mt-0">{ t('modal_rename.help.metadata') }</p>
          </label>
        </div>
      </ModalBody>
      <ModalFooter>
        <div className="d-flex justify-content-between">
          <ApiErrorMessage errorCode={errorCode} errorMessage={errorMessage} linkPath={path} />
        </div>
        <div className="d-flex justify-content-end">
          <button type="submit" className="btn btn-primary" onClick={clickRenameButtonHandler}>Rename</button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

/**
 * Wrapper component for using unstated
 */
const ModalControlWrapper = (props) => {
  return createSubscribedElement(RenameModal, props, [AppContainer, PageContainer]);
};


RenameModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(ModalControlWrapper);
