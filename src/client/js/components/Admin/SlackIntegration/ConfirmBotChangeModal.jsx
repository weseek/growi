import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

const ConfirmBotChangeModal = ({ show, onConfirmClick, onCancelClick }) => {
  const { t } = useTranslation('admin');

  return (
    <>
      <Modal isOpen={show} centered>
        <ModalHeader toggle={onCancelClick}>
          {t('slack_integration.modal.warning')}
        </ModalHeader>
        <ModalBody>
          <div>
            <h4>{t('slack_integration.modal.sure_change_bot_type')}</h4>
          </div>
          <div>
            <p>{t('slack_integration.modal.changes_will_be_deleted')}</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={onCancelClick}>
            {t('slack_integration.modal.cancel')}
          </Button>
          <Button color="primary" onClick={onConfirmClick}>
            {t('slack_integration.modal.change')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

ConfirmBotChangeModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onConfirmClick: PropTypes.func.isRequired,
  onCancelClick: PropTypes.func.isRequired,
};

export default ConfirmBotChangeModal;
