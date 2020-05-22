import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';
import { format } from 'date-fns';
import urljoin from 'url-join';

import { userPageRoot } from '@commons/util/path-utils';
import { pathUtils } from 'growi-commons';
import { createSubscribedElement } from './UnstatedUtils';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';
import PagePathAutoComplete from './PagePathAutoComplete';

const RenameModal = (props) => {
  const { t, appContainer, pageContainer } = props;
  const { path } = pageContainer.state;
  console.log(path);
  const config = appContainer.getConfig();
  const isReachable = config.isSearchServiceReachable;

  const userPageRootPath = userPageRoot(appContainer.currentUser);
  const parentPath = pathUtils.addTrailingSlash(path);
  const { crowi } = appContainer.config;
  // const now = format(new Date(), 'yyyy/MM/dd');

  const [todayInput1, setTodayInput1] = useState(t('Memo'));
  const [todayInput2, setTodayInput2] = useState('');
  const [pageNameInput, setPageNameInput] = useState(parentPath);
  const [template, setTemplate] = useState(null);

  // 現在のページ名
  // function currentPageName() {
  //   return (
  //     <div className="form-group">
  //       <label>{ t('modal_rename.label.Current page name') }</label><br />
  //       <code>{page}</code>
  //     </div>
  //   );
  // }

  // 移動先のページ名
  function pageToMoveTo() {
    return (
      <div className="form-group">
        <label htmlFor="newPageName">{ t('modal_rename.label.New page name') }</label><br />
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">{pageNameInput}</span>
          </div>
          <div id="rename-page-name-input" className="page-name-input flex-fill"></div>
          <input type="text" className="form-control" name="new_path" id="newPageName" value={pageNameInput} />
        </div>
      </div>
    );
  };

  function checkListForMovePage() {

  }

  return (
    <Modal isOpen={appContainer.state.isRenameModalShown} toggle={appContainer.closeRenameModal}>
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
            <div id="rename-page-name-input" className="page-name-input flex-fill"></div>
            <input type="text" className="form-control" name="new_path" id="newPageName" value={path} />
          </div>
        </div>
        <div className="custom-control custom-checkbox custom-checkbox-warning">
          <input
            className="custom-control-input"
            name="recursively"
            id="cbRenameRecursively"
            value="1"
            type="checkbox"
            checked
          />
          <label className="custom-control-label" htmlFor="cbRenameRecursively">
            { t('modal_rename.label.Recursively') }
            <p className="form-text text-muted mt-0">{ t('modal_rename.help.recursive', path) }</p>
          </label>
        </div>

        <div className="custom-control custom-checkbox custom-checkbox-success">
          <input className="custom-control-input" name="create_redirect" id="cbRenameRedirect" value="1" type="checkbox" />
          <label className="custom-control-label" htmlFor="cbRenameRedirect">
            { t('modal_rename.label.Redirect') }
            <p className="form-text text-muted mt-0">{ t('modal_rename.help.redirect', path) }</p>
          </label>
        </div>

        <div className="custom-control custom-checkbox custom-checkbox-primary">
          <input className="custom-control-input" name="remain_metadata" id="cbRenameMetadata" value="1" type="checkbox" />
          <label className="custom-control-label" htmlFor="cbRenameMetadata">
            { t('modal_rename.label.Do not update metadata') }
            <p className="form-text text-muted mt-0">{ t('modal_rename.help.metadata') }</p>
          </label>
        </div>
      </ModalBody>
      <ModalFooter>
        <div className="d-flex justify-content-end">
          <button type="submit" className="btn btn-primary">Rename</button>
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
