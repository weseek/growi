import React, { useState } from 'react';

import { useTranslation } from 'next-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

type DownloadDictModalProps = {
  isModalOpen: boolean
  onEnableTextlint?: (isSkipAskingAgainChecked: boolean) => void;
  onCancel?: () => void;
};

export const DownloadDictModal = (props: DownloadDictModalProps): JSX.Element => {
  const { t } = useTranslation('');
  const [isSkipAskingAgainChecked, setIsSkipAskingAgainChecked] = useState(false);

  const onCancel = () => {
    if (props.onCancel != null) {
      props.onCancel();
    }
  };

  const onConfirmEnableTextlint = () => {
    if (props.onEnableTextlint != null) {
      props.onEnableTextlint(isSkipAskingAgainChecked);
    }
  };

  return (
    <Modal isOpen={props.isModalOpen} toggle={onCancel} className="">
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
            checked={isSkipAskingAgainChecked}
            onChange={e => setIsSkipAskingAgainChecked(e.target.checked)}
          />
          <label className="custom-control-label align-center" htmlFor="dont-ask-again">
            {t('modal_enable_textlint.dont_ask_again')}
          </label>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onCancel}
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
