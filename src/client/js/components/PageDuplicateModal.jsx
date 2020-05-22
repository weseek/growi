import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from './UnstatedUtils';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';
import PagePathAutoComplete from './PagePathAutoComplete';
import ApiErrorMessage from './PageManagement/ApiErrorMessage';

const PageDuplicateModal = (props) => {
  const { t, appContainer, pageContainer } = props;

  const config = appContainer.getConfig();
  const isReachable = config.isSearchServiceReachable;
  const { pageId, path } = pageContainer.state;
  const { crowi } = appContainer.config;

  const [pageNameInput, setPageNameInput] = useState(path);
  const [errorCode, setErrorCode] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  /**
   * change pageNameInput
   * @param {string} value
   */
  function onChangePageNameInputHandler(value) {
    setPageNameInput(value);
  }

  async function clickDuplicateButtonHandler() {
    try {
      setErrorCode(null);
      setErrorMessage(null);
      const res = await appContainer.apiPost('/pages.duplicate', { page_id: pageId, new_path: pageNameInput });
      const { page } = res;
      // window.location.href = encodeURI(`${page.path}?duplicated=${path}`);
    }
    catch (err) {
      setErrorCode(err.code);
      setErrorMessage(err.message);
    }
  }

  function hoge(event) {
    console.log(event);
  }


  return (
    <Modal isOpen={pageContainer.state.isPageDuplicateModalShown} toggle={pageContainer.closePageDuplicateModal} className="grw-duplicate-page">
      <ModalHeader tag="h4" toggle={pageContainer.closePageDuplicateModal} className="bg-primary text-light">
        { t('modal_duplicate.label.Duplicate page') }
      </ModalHeader>
      <ModalBody>
        <div className="form-group">
          <label htmlFor="">{ t('modal_duplicate.label.Current page name') }</label><br />
          <code>{ path }</code>
        </div>
        <div className="form-group">
          <label htmlFor="duplicatePageName">{ t('modal_duplicate.label.New page name') }</label><br />
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">{crowi.url}</span>
            </div>
            {isReachable
              ? (
                <PagePathAutoComplete
                  crowi={appContainer}
                  initializedPath={path}
                  addTrailingSlash
                  onClickSubmit={hoge}
                  onInputChange={onChangePageNameInputHandler}
                />
              )
              : (
                <input
                  type="text"
                  value={pageNameInput}
                  className="form-control"
                  onChange={e => onChangePageNameInputHandler(e.target.value)}
                  required
                />
              )}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <ApiErrorMessage errorCode={errorCode} errorMessage={errorMessage} linkPath={path} />
        <button type="button" className="btn btn-primary" onClick={clickDuplicateButtonHandler}>Duplicate page</button>
      </ModalFooter>
    </Modal>

  );
};


/**
 * Wrapper component for using unstated
 */
const PageDuplicateModallWrapper = (props) => {
  return createSubscribedElement(PageDuplicateModal, props, [AppContainer, PageContainer]);
};


PageDuplicateModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(PageDuplicateModallWrapper);
