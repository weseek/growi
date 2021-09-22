import React, { useState, FC } from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { useTranslation } from 'react-i18next';

export const DownloadDictModal: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const { t } = useTranslation('');
  return (
    <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} className="">
      <ModalHeader tag="h4" toggle={() => setIsModalOpen(false)} className="bg-warning">
        <i className="icon-fw icon-question" />
        Warning
      </ModalHeader>
      <ModalBody>
        {t('modal_enable_textlint.confirm_download_dict_and_enable_textlint')}
      </ModalBody>
      <ModalFooter>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => console.log('button')}
        >
          {t('Cancel')}
        </button>
        <button
          type="button"
          className="btn btn-outline-primary ml-3"
          onClick={() => console.log('button')}
        >
          {t('modal_enable_textlint.enable_textlint')}
        </button>
      </ModalFooter>
    </Modal>
  );
};
