import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import Modal from 'reactstrap/es/Modal';
import ModalBody from 'reactstrap/es/ModalBody';
import ModalFooter from 'reactstrap/es/ModalFooter';
import ModalHeader from 'reactstrap/es/ModalHeader';

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
            {t('notification_settings.delete_notification_pattern_desc1', { path: notificationForConfiguration.triggerPath })}
          </p>
          <p className="text-danger">
            {t('notification_settings.delete_notification_pattern_desc2')}
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const NotificationDeleteModalWrapperFC = (props) => {
  const { t } = useTranslation('admin');

  return <NotificationDeleteModal t={t} {...props} />;
};

export default NotificationDeleteModalWrapperFC;
