import React from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from './UnstatedUtils';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

import ShareLinkList from './ShareLinkList';
import ShareLinkForm from './ShareLinkForm';

const OutsideShareLinkModal = (props) => {

  /* const { t } = props; */

  return (
    <Modal size="lg" isOpen={props.isOpen} toggle={props.onClose} className="grw-create-page">
      <ModalHeader tag="h4" toggle={props.onClose} className="bg-primary text-light">Title
      </ModalHeader>
      <ModalBody>
        <div className="container">
          <div className="row align-items-center mb-3 mr-0">
            <h4 className="col-10">Shared Link List</h4>
            <button className="col btn btn-danger" type="button">Delete all links</button>
          </div>

          <div>
            <ShareLinkList />
            <button className="btn btn-outline-secondary d-block mx-auto px-5 mb-3" type="button">+</button>
            <ShareLinkForm />
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

/**
 * Wrapper component for using unstated
 */
const ModalControlWrapper = (props) => {
  return createSubscribedElement(OutsideShareLinkModal, props, [AppContainer, PageContainer]);
};


OutsideShareLinkModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withTranslation()(ModalControlWrapper);
