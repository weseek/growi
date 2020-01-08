import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Modal from 'react-bootstrap/es/Modal';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class NotificationDeleteModal extends React.PureComponent {

  render() {
    const { t } = this.props;

    return (
      <Modal show={this.props.isOpen} onHide={this.props.onClose}>
        <Modal.Header className="modal-header" closeButton>
          <Modal.Title>
            <div className="modal-header bg-danger">
              <i className="icon icon-fire"></i> Delete Global Notification Setting
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <span className="text-danger">
            {t('notification_setting.delete_notification_pattern_desc')}
          </span>
        </Modal.Body>
        <Modal.Footer className="text-right">
          <button type="button" className="btn btn-sm btn-danger" onClick={this.props.onClickSubmit}>
            <i className="icon icon-fire"></i> {t('Delete')}
          </button>
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
  onClickSubmit: PropTypes.func.isRequired,
};

export default withTranslation()(NotificationDeleteModalWrapper);
