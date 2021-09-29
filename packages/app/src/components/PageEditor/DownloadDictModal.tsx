import React, { useState, FC } from 'react';
import PropTypes from 'prop-types';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { useTranslation } from 'react-i18next';

type DownloadDictModalProps = {
  isModalOpen: boolean
  onConfirmEnableTextlint?: (isDontAskAgainChecked: boolean) => void;
  onCancel?: () => void;
};

export const DownloadDictModal: FC<DownloadDictModalProps> = ({
  isModalOpen, onConfirmEnableTextlint, onCancel,
}) => {
  const { t } = useTranslation('');
  const [isDontAskAgainChecked, setIsDontAskAgainChecked] = useState(true);

  return (
    <Modal isOpen={isModalOpen} toggle={onCancel} className="">
      <ModalHeader tag="h4" toggle={onCancel} className="bg-warning">
        <i className="icon-fw icon-question" />
        Warning
      </ModalHeader>
      <ModalBody>
        {t('modal_enable_textlint.confirm_download_dict_and_enable_textlint')}
      </ModalBody>
      <ModalFooter>
        <div className="mr-3 custom-control custom-checkbox custom-checkbox-info">
          <input
            type="checkbox"
            className="custom-control-input"
            id="dont-ask-again"
            checked={isDontAskAgainChecked}
            onChange={e => setIsDontAskAgainChecked(e.target.checked)}
          />
          <label className="custom-control-label align-center" htmlFor="dont-ask-again">
            {t('modal_enable_textlint.dont_ask_again')}
          </label>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => {
            if (onCancel != null) { onCancel() }
          }}
        >
          {t('Cancel')}
        </button>
        <button
          type="button"
          className="btn btn-outline-primary ml-3"
          onClick={() => {
            if (onConfirmEnableTextlint != null) {
              onConfirmEnableTextlint(isDontAskAgainChecked);
            }
          }
          }
        >
          {t('modal_enable_textlint.enable_textlint')}
        </button>
      </ModalFooter>
    </Modal>
  );
};

DownloadDictModal.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
  onConfirmEnableTextlint: PropTypes.func,
  onCancel: PropTypes.func,
};
