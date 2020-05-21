import React from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from './UnstatedUtils';
import PageContainer from '../services/PageContainer';

const PutBackPageModal = (props) => {
  const {
    t, isOpen, toggle, onClickSubmit, pageContainer,
  } = props;

  const { path } = pageContainer.state;

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="grw-create-page">
      <ModalHeader tag="h4" toggle={toggle} className="bg-info text-light">
        <i className="icon-action-undo mr-2" aria-hidden="true"></i> { t('Put Back Page') }
      </ModalHeader>
      <ModalBody>
        <div className="form-group">
          <label htmlFor="">Put back page:</label><br />
          <code>{path}</code>
        </div>
        <div className="custom-control custom-checkbox custom-checkbox-warning">
          <input className="custom-control-input" name="recursively" id="cbPutbackRecursively" value="1" type="checkbox" checked></input>
          <label className="custom-control-label" htmlFor="cbPutbackRecursively">
            { t('modal_putback.label.recursively') }
            <p className="form-text text-muted mt-0">{ t('modal_putback.help.recursively', path) }</p>
          </label>
        </div>
      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-info" onClick={onClickSubmit}>
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

  page: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  onClickSubmit: PropTypes.func.isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};


export default withTranslation()(PutBackPageModalWrapper);
