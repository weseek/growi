import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

const DeleteSlackBotSettingsModal = React.memo((props) => {
  const { t, onClickDeleteButton, onClose } = useTranslation();

  const deleteSlackCredentialsHandler = useCallback(() => {
    onClickDeleteButton?.();
    onClose?.();
  }, [onClickDeleteButton, onClose]);

  const closeButtonHandler = useCallback(() => {
    onClose?.();
  }, [onClose]);

  return (
    <Modal isOpen={props.isOpen} toggle={closeButtonHandler} className="page-comment-delete-modal">
      <ModalHeader tag="h4" toggle={closeButtonHandler} className="bg-danger text-light">
        <span>
          {props.isResetAll && (
            <>
              <i className="icon-fw icon-fire" />
              {t('admin:slack_integration.reset_all_settings')}
            </>
          )}
          {!props.isResetAll && (
            <>
              <i className="icon-trash me-1" />
              {t('admin:slack_integration.delete_slackbot_settings')}
            </>
          )}
        </span>
      </ModalHeader>
      <ModalBody>
        {props.isResetAll && (
          <span
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.all_settings_of_the_bot_will_be_reset') }}
          />
        )}
        {!props.isResetAll && (
          <span
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.slackbot_settings_notice') }}
          />
        )}
      </ModalBody>
      <ModalFooter>
        <Button onClick={closeButtonHandler}>{t('Cancel')}</Button>
        <Button color="danger" onClick={deleteSlackCredentialsHandler}>
          {props.isResetAll && (
            <>
              <i className="icon icon-fire"></i>
              {t('admin:slack_integration.reset')}
            </>
          )}
          {!props.isResetAll && (
            <>
              <i className="icon-trash me-1" />
              {t('admin:slack_integration.delete')}
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );

});

DeleteSlackBotSettingsModal.propTypes = {
  isResetAll: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onClickDeleteButton: PropTypes.func,
};

DeleteSlackBotSettingsModal.displayName = 'DeleteSlackBotSettingsModal';

export default DeleteSlackBotSettingsModal;
