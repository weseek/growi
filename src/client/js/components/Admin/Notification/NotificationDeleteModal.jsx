import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

class NotificationDeleteModal extends React.PureComponent {

  render() {
    const { t, notificationForConfiguration } = this.props;
    return (
      <Modal isOpen={this.props.isOpen} toggle={this.props.onClose}>
        <ModalHeader tag="h4" toggle={this.props.onClose} className="bg-danger text-light">
          <i className="icon icon-fire"></i> Delete Global Notification Setting
        </ModalHeader>
        <ModalBody>
          <p>
            {t('notification_setting.delete_notification_pattern_desc1', { path: notificationForConfiguration.triggerPath })}
          </p>
          <p className="text-danger">
            {t('notification_setting.delete_notification_pattern_desc2')}
          </p>
        </ModalBody>
        <ModalFooter>
          <button type="button" className="btn btn-sm btn-danger" onClick={this.props.onClickSubmit}>
            <i className="icon icon-fire"></i> {t('Delete')}
          </button>
        </ModalFooter>
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
