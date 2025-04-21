import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

type DeleteSlackBotSettingsModalProps = {
  isResetAll: boolean;
  isOpen: boolean;
  onClose?: () => void;
  onClickDeleteButton?: () => void;
};

export const DeleteSlackBotSettingsModal = React.memo((props: DeleteSlackBotSettingsModalProps) => {
  const { t } = useTranslation();

  const { isResetAll, isOpen, onClose, onClickDeleteButton } = props;

  const deleteSlackCredentialsHandler = useCallback(() => {
    onClickDeleteButton?.();
    onClose?.();
  }, [onClickDeleteButton, onClose]);

  const closeButtonHandler = useCallback(() => {
    onClose?.();
  }, [onClose]);

  return (
    <Modal isOpen={isOpen} toggle={closeButtonHandler} className="page-comment-delete-modal">
      <ModalHeader tag="h4" toggle={closeButtonHandler} className="text-danger">
        <span>
          {isResetAll && (
            <>
              <span className="material-symbols-outlined">delete_forever</span>
              {t('admin:slack_integration.reset_all_settings')}
            </>
          )}
          {!isResetAll && (
            <>
              <span className="material-symbols-outlined">delete</span>
              {t('admin:slack_integration.delete_slackbot_settings')}
            </>
          )}
        </span>
      </ModalHeader>
      <ModalBody>
        {isResetAll && (
          <span
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.all_settings_of_the_bot_will_be_reset') }}
          />
        )}
        {!isResetAll && (
          <span
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.slackbot_settings_notice') }}
          />
        )}
      </ModalBody>
      <ModalFooter>
        <Button onClick={closeButtonHandler}>{t('Cancel')}</Button>
        <Button color="danger" onClick={deleteSlackCredentialsHandler}>
          {isResetAll && (
            <>
              <span className="material-symbols-outlined">delete_forever</span>
              {t('admin:slack_integration.reset')}
            </>
          )}
          {!isResetAll && (
            <>
              <span className="material-symbols-outlined">delete</span>
              {t('admin:slack_integration.delete')}
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
});

DeleteSlackBotSettingsModal.displayName = 'DeleteSlackBotSettingsModal';
