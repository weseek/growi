import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from './UnstatedUtils';

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

  // errors:array
  const [errors, setErrors] = useState(null);

  const [subordinatedPaths, setSubordinatedPaths] = useState([]);
  const [getSubordinatedError, setGetSuborinatedError] = useState(null);

  const [isDuplicateRecursively, setIsDuplicateRecursively] = useState(true);

  /**
   * change pageNameInput for PagePathAutoComplete
   * @param {string} value
   */
  function ppacInputChangeHandler(value) {
    setPageNameInput(value);
  }

  /**
   * change pageNameInput
   * @param {string} value
   */
  function inputChangeHandler(value) {
    setPageNameInput(value);
  }

  function changeIsDuplicateRecursivelyHandler() {
    setIsDuplicateRecursively(!isDuplicateRecursively);
  }

  const getSubordinatedList = useCallback(async() => {
    try {
      const res = await appContainer.apiv3Get('/pages/subordinated-list', { path });
      setSubordinatedPaths(res.data.resultPaths);
    }
    catch (err) {
      setGetSuborinatedError(t('modal_duplicate.label.Fail to get subordinated pages'));
    }
  }, [appContainer, path, t]);

  useEffect(() => {
    if (props.isOpen) {
      getSubordinatedList();
    }
  }, [props.isOpen, getSubordinatedList]);

  async function duplicate() {
    setErrors(null);

    try {
      const res = await appContainer.apiPost('/pages.duplicate', { page_id: pageId, new_path: pageNameInput });
      const { page } = res;
      window.location.href = encodeURI(`${page.path}?duplicated=${path}`);
    }
    catch (err) {
      setErrors(err);
    }
  }

  function ppacSubmitHandler() {
    duplicate();
  }

  return (
    <Modal size="lg" isOpen={props.isOpen} toggle={props.onClose} className="grw-duplicate-page">
      <ModalHeader tag="h4" toggle={props.onClose} className="bg-primary text-light">
        { t('modal_duplicate.label.Duplicate page') }
      </ModalHeader>
      <ModalBody>
        <div className="form-group"><label>{t('modal_duplicate.label.Current page name')}</label><br />
          <code>{path}</code>
        </div>
        <div className="form-group">
          <label htmlFor="duplicatePageName">{ t('modal_duplicate.label.New page name') }</label><br />
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">{crowi.url}</span>
            </div>
            <div className="flex-fill">
              {isReachable
              ? (
                <PagePathAutoComplete
                  crowi={appContainer}
                  initializedPath={path}
                  onSubmit={ppacSubmitHandler}
                  onInputChange={ppacInputChangeHandler}
                />
              )
              : (
                <input
                  type="text"
                  value={pageNameInput}
                  className="form-control"
                  onChange={e => inputChangeHandler(e.target.value)}
                  required
                />
              )}
            </div>
          </div>
        </div>
        <div className="custom-control custom-checkbox custom-checkbox-warning">
          <input
            className="custom-control-input"
            name="recursively"
            id="cbDuplicateRecursively"
            type="checkbox"
            checked={isDuplicateRecursively}
            onChange={changeIsDuplicateRecursivelyHandler}
          />
          <label className="custom-control-label" htmlFor="cbDuplicateRecursively">
            { t('modal_duplicate.label.Duplicate with child') }
          </label>
          <div>
            <ul>
              {isDuplicateRecursively && subordinatedPaths.map(duplicatedNewPath => <li key={duplicatedNewPath}>{duplicatedNewPath}</li>)}
            </ul>
          </div>
          <div> {getSubordinatedError} </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <ApiErrorMessage errors={errors} targetPath={pageNameInput} />
        <button type="button" className="btn btn-primary" onClick={duplicate}>Duplicate page</button>
      </ModalFooter>
    </Modal>
  );
};


/**
 * Wrapper component for using unstated
 */
const PageDuplicateModallWrapper = withUnstatedContainers(PageDuplicateModal, [AppContainer, PageContainer]);


PageDuplicateModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withTranslation()(PageDuplicateModallWrapper);
