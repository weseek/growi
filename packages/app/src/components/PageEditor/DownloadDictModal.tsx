import React, { FC, Dispatch, SetStateAction } from 'react';
import PropTypes from 'prop-types';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { useTranslation } from 'react-i18next';

type DownloadDictModalProps = {
  isModalOpen: boolean
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  isDontAskAgainChecked: boolean;
  setIsDontAskAgainChecked: Dispatch<SetStateAction<boolean>>;
  onConfirmEnableTextlint: () => void;
  onModalClose: () => void;
};

export const DownloadDictModal: FC<DownloadDictModalProps> = ({
  onConfirmEnableTextlint, isDontAskAgainChecked, setIsDontAskAgainChecked, isModalOpen, onModalClose,
}) => {
  const { t } = useTranslation('');

  return (
    <Modal isOpen={isModalOpen} toggle={onModalClose} className="">
      <ModalHeader tag="h4" toggle={onModalClose} className="bg-warning">
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
          onClick={onModalClose}
        >
          {t('Cancel')}
        </button>
        <button
          type="button"
          className="btn btn-outline-primary ml-3"
          onClick={onConfirmEnableTextlint}
        >
          {t('modal_enable_textlint.enable_textlint')}
        </button>
      </ModalFooter>
    </Modal>
  );
};

DownloadDictModal.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
  isDontAskAgainChecked: PropTypes.bool.isRequired,
  setIsDontAskAgainChecked: PropTypes.func.isRequired,
  onConfirmEnableTextlint: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
