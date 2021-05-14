import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

const DeleteSlackBotSettingsModal = React.memo((props) => {
  const { t } = props;

  function closeModal() {
    if (props.onClose == null) {
      return;
    }

    props.onClose();
  }

  function deleteSlackCredentialsHandler() {
    if (props.onClickDeleteButton == null) {
      return;
    }
    props.onClickDeleteButton();

    closeModal();
  }

  function closeButtonHandler() {
    closeModal();
  }

  return (
    <Modal isOpen={props.isOpen} toggle={closeButtonHandler} className="page-comment-delete-modal">
      <ModalHeader tag="h4" toggle={closeButtonHandler} className="bg-danger text-light">
        <span>
          <i className="icon-fw icon-fire"></i>
          {props.isResetAll && (
            <>
              {t('admin:slack_integration.reset_all_settings')}
            </>
          )}
          {!props.isResetAll && (
            <>
              {t('admin:slack_integration.delete_slackbot_settings')}
            </>
          )}
        </span>
      </ModalHeader>
      <ModalBody>
        {t('admin:slack_integration.slackbot_settings_notice')}
      </ModalBody>
      <ModalFooter>
        <Button onClick={closeButtonHandler}>{t('Cancel')}</Button>
        <Button color="danger" onClick={deleteSlackCredentialsHandler}>
          <i className="icon icon-fire"></i>
          {t('admin:slack_integration.reset')}
        </Button>
      </ModalFooter>
    </Modal>
  );

});

DeleteSlackBotSettingsModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  isResetAll: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onClickDeleteButton: PropTypes.func,
};

export default withTranslation()(DeleteSlackBotSettingsModal);
