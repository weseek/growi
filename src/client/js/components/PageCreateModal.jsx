
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';
import { format } from 'date-fns';

import { userPageRoot } from '@commons/util/path-utils';
import { createSubscribedElement } from './UnstatedUtils';
import AppContainer from '../services/AppContainer';

const PageCreateModal = (props) => {
  const { t, appContainer } = props;

  const [todayInput1, setTodayInput1] = useState(t('Memo'));
  const [todayInput2, setTodayInput2] = useState('');

  /**
   * onmemo
   * @param {string} value
   */
  function onChangeTodayInput1(value) {
    setTodayInput1(value);
  }

  /**
   * onmemo
   * @param {string} value
   */
  function onChangeTodayInput2(value) {
    setTodayInput2(value);
  }


  return (
    <Modal size="lg" isOpen={appContainer.state.isPageCreateModalShown} toggle={appContainer.closePageCreateModal}>
      <ModalHeader tag="h4" toggle={appContainer.closePageCreateModal} className="bg-primary text-light">
        { t('New Page') }
      </ModalHeader>
      <ModalBody>
        <div className="row form-group">
          <fieldset className="col-12 mb-4">
            <h3 className="grw-modal-head pb-2">{ t("Create today's") }</h3>
            <div className="d-flex">
              <div className="create-page-input-row d-flex align-items-center">
                <span>{ userPageRoot(appContainer.currentUser) }/</span>
                <input
                  type="text"
                  className="page-today-input1 form-control text-center"
                  value={todayInput1}
                  onChange={e => onChangeTodayInput1(e.target.value)}
                />
                <span className="page-today-suffix">/{format(new Date(), 'yyyy/MM/dd')}/</span>
                <input
                  type="text"
                  className="page-today-input2 form-control"
                  id="page-today-input2"
                  placeholder={t('Input page name (optional)')}
                  value={todayInput2}
                  onChange={e => onChangeTodayInput2(e.target.value)}
                />
              </div>
              <div className="create-page-button-container">
                <button type="submit" className="btn btn-outline-primary rounded-pill"><i className="icon-fw icon-doc"></i>{ t('Create') }</button>
              </div>
            </div>
          </fieldset>
        </div>
      </ModalBody>
      <ModalFooter>
      </ModalFooter>
    </Modal>

  );
};


/**
 * Wrapper component for using unstated
 */
const ModalControlWrapper = (props) => {
  return createSubscribedElement(PageCreateModal, props, [AppContainer]);
};


PageCreateModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(ModalControlWrapper);
