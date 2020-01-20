import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Modal from 'react-bootstrap/es/Modal';

class NotificationDeleteModal extends React.PureComponent {

  render() {
    const { t, notificationForConfiguration } = this.props;
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
          <p>
            {t('notification_setting.delete_notification_pattern_desc1', { path: notificationForConfiguration.triggerPath })}
          </p>
          <span className="text-danger">
            {t('notification_setting.delete_notification_pattern_desc2')}
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

NotificationDeleteModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onClickSubmit: PropTypes.func.isRequired,
  notificationForConfiguration: PropTypes.object.isRequired,
};

export default withTranslation()(NotificationDeleteModal);
