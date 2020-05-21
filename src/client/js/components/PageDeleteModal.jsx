
import React from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from './UnstatedUtils';

import AppContainer from '../services/AppContainer';

const PageDeleteModal = (props) => {
  const {
    t, isOpen, toggle, isDeleteCompletely,
  } = props;

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="grw-create-page">
      <ModalHeader tag="h4" toggle={toggle} className="bg-danger text-light">
        {isDeleteCompletely && <span><i className="icon-fw icon-fire"></i>{ t('modal_delete.delete_completely') }</span>}
        {!isDeleteCompletely && <span><i className="icon-fw icon-trash"></i>{ t('modal_delete.delete_page') }</span>}
      </ModalHeader>
      <ModalBody>
        { t('modal_empty.notice')}
      </ModalBody>
      <ModalFooter>

      </ModalFooter>
    </Modal>

  );
};


/**
 * Wrapper component for using unstated
 */
const PageDeleteModalWrapper = (props) => {
  return createSubscribedElement(PageDeleteModal, props, [AppContainer]);
};


PageDeleteModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  onClickSubmit: PropTypes.func.isRequired,

  isDeleteCompletely: PropTypes.bool,
};

PageDeleteModal.defaultProps = {
  isDeleteCompletely: false,
};

export default withTranslation()(PageDeleteModalWrapper);
