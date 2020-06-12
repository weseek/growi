import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from './UnstatedUtils';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

import ShareLinkList from './ShareLinkList';
import ShareLinkForm from './ShareLinkForm';

const OutsideShareLinkModal = (props) => {
  const [isOpenShareLinkForm, setIsOpenShareLinkForm] = useState(false);

  function toggleShareLinkFormHandler() {
    setIsOpenShareLinkForm(!isOpenShareLinkForm);
  }

  return (
    <Modal size="xl" isOpen={props.isOpen} toggle={props.onClose} className="grw-create-page">
      <ModalHeader tag="h4" toggle={props.onClose} className="bg-primary text-light">Title
      </ModalHeader>
      <ModalBody>
        <div className="container">
          <div className="form-inline mb-3">
            <h4>Shared Link List</h4>
            <button className="ml-auto btn btn-danger" type="button">Delete all links</button>
          </div>

          <div>
            <ShareLinkList />
            <button
              className="btn btn-outline-secondary d-block mx-auto px-5 mb-3"
              type="button"
              onClick={toggleShareLinkFormHandler}
            >
              {isOpenShareLinkForm ? 'Close' : 'New'}
            </button>
            {isOpenShareLinkForm && <ShareLinkForm />}
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

/**
 * Wrapper component for using unstated
 */
const ModalControlWrapper = withUnstatedContainers(OutsideShareLinkModal, [AppContainer, PageContainer]);

OutsideShareLinkModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withTranslation()(ModalControlWrapper);
