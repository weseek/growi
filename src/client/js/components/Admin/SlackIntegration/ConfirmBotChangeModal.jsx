import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

const ConfirmBotChangeModal = (props) => {
  const { t } = useTranslation('admin');
  let isOpen = false;
  let onConfirmClick = null;
  let onCancelClick = null;

  if (props.isOpen != null) {
    isOpen = props.isOpen;
  }

  if (props.onConfirmClick != null) {
    onConfirmClick = props.onConfirmClick;
  }

  if (props.onCancelClick != null) {
    onCancelClick = props.onCancelClick;
  }

  return (
    <Modal isOpen={isOpen} centered>
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
        <button type="button" className="btn btn-secondary" onClick={onCancelClick}>
          {t('slack_integration.modal.cancel')}
        </button>
        <button type="button" className="btn btn-primary" onClick={onConfirmClick}>
          {t('slack_integration.modal.change')}
        </button>
      </ModalFooter>
    </Modal>
  );
};

ConfirmBotChangeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onConfirmClick: PropTypes.func,
  onCancelClick: PropTypes.func,
};

export default ConfirmBotChangeModal;
