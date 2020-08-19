import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from './UnstatedUtils';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';
import PagePathAutoComplete from './PagePathAutoComplete';
import ApiErrorMessageList from './PageManagement/ApiErrorMessageList';

const PageDuplicateModal = (props) => {
  const { t, appContainer, pageContainer } = props;

  const config = appContainer.getConfig();
  const isReachable = config.isSearchServiceReachable;
  const { pageId, path } = pageContainer.state;
  const { crowi } = appContainer.config;

  const [pageNameInput, setPageNameInput] = useState(path);

  const [errs, setErrs] = useState(null);

  const [getSubordinatedError] = useState(null);
  const [isDuplicateRecursively, setIsDuplicateRecursively] = useState(true);
  const [isDuplicateRecursivelyWithoutExistPath, setIsDuplicateRecursivelyWithoutExistPath] = useState(true);
  const [isDuplicateExist, setIsDuplicateExist] = useState([]);


  function createSubordinatedList(value) {

    // ToDo: get the duplicated list from sever
    // below is psuedo code
    // let duplicatedList = get.apiv3......
    // duplicatedList = duplicatedList.map((value) =>
    // <li className="duplicate-exist" key={value}> {value}: { t('modal_duplicate.label.Same page already exists') } </li>; )
    // setIsDuplicateExist(duplicatedList);

    // for now we use dummy path
    setIsDuplicateExist(['/test146/test147', value]);
  }

  /**
   * change pageNameInput for PagePathAutoComplete
   * @param {string} value
   */
  function ppacInputChangeHandler(value) {
    createSubordinatedList(value);
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

  function changeIsDuplicateRecursivelyWithoutExistPathHandler() {
    setIsDuplicateRecursivelyWithoutExistPath(!isDuplicateRecursivelyWithoutExistPath);
  }

  //   function changeIsExistHandler() {
  //     setIsExist(true);
  //   }


  async function duplicate() {
    setErrs(null);

    try {
      const res = await appContainer.apiv3Post('/pages/duplicate', { pageId, pageNameInput });
      const { page } = res.data;
      window.location.href = encodeURI(`${page.path}?duplicated=${path}`);
    }
    catch (err) {
      setErrs(err);
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
        </div>

        <div
          className="custom-control custom-checkbox custom-checkbox-warning"
          style={{ display: (isDuplicateExist.length !== 0) && isDuplicateRecursively ? '' : 'none' }}
        >
          <input
            className="custom-control-input"
            name="withoutExistRecursively"
            id="cbDuplicatewithoutExistRecursively"
            type="checkbox"
            checked={isDuplicateRecursivelyWithoutExistPath}
            onChange={changeIsDuplicateRecursivelyWithoutExistPathHandler}
          />
          <label className="custom-control-label" htmlFor="cbDuplicatewithoutExistRecursively">
            { t('modal_duplicate.label.Duplicate without exist path') }
          </label>
        </div>

        <div>
          <ul className="duplicate-name">
            {isDuplicateRecursively && isDuplicateExist.length !== 0 && isDuplicateExist}
          </ul>
        </div>
        <div> {getSubordinatedError} </div>
      </ModalBody>
      <ModalFooter>
        <ApiErrorMessageList errs={errs} targetPath={pageNameInput} />
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
