
import React from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from './UnstatedUtils';
import AppContainer from '../services/AppContainer';

const PageCreateModal = (props) => {
  const { t, appContainer } = props;

  return (
    <Modal size="lg" isOpen={appContainer.state.isPageCreateModalShown} toggle={appContainer.closePageCreateModal}>
      <ModalHeader tag="h4" toggle={appContainer.closePageCreateModal} className="bg-primary text-light">
        { t('New Page') }
      </ModalHeader>
      <ModalBody>
        <div className="row form-group">
          <fieldset className="col-12 mb-4">
            <h3 className="grw-modal-head pb-2">{ t("Create today's") }</h3>
            <div className="d-flex create-page-input-container">
              <div className="create-page-input-row d-flex align-items-center">
                {/* <span class="page-today-prefix">{ userPageRoot(user) }}/</span>
                  <input type="text" data-prefix="{{ userPageRoot(user) }}/" class="page-today-input1 form-control text-center" value="{{ t('Memo') }}" id="" name="">
                  <span class="page-today-suffix">/{ now|datetz('Y/m/d') }}/</span>
                  <input type="text" data-prefix="/{{ now|datetz('Y/m/d') }}/" class="page-today-input2 form-control" id="page-today-input2" name="" placeholder="{{ t('Input page name (optional)') }}"> */}
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
