import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Modal from 'react-bootstrap/es/Modal';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class NotificationDeleteModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    };

  }


  render() {

    return (
      <Modal show={this.props.isOpen} onHide={this.props.onClose}>
        <Modal.Header className="modal-header" closeButton>
          <Modal.Title>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          hoge
        </Modal.Body>
        <Modal.Footer className="d-flex">

        </Modal.Footer>
      </Modal>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const NotificationDeleteModalWrapper = (props) => {
  return createSubscribedElement(NotificationDeleteModal, props, [AppContainer]);
};


NotificationDeleteModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withTranslation()(NotificationDeleteModalWrapper);
