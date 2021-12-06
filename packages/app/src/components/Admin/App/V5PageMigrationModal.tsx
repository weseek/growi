import React, { FC } from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { useTranslation } from 'react-i18next';

type V5PageMigrationModalProps = {
  isModalOpen: boolean
  onConfirm?: () => Promise<void>;
  onCancel?: () => void;
};

export const V5PageMigrationModal: FC<V5PageMigrationModalProps> = (props: V5PageMigrationModalProps) => {
  const { t } = useTranslation();

  const onCancel = () => {
    if (props.onCancel != null) {
      props.onCancel();
    }
  };

  const onConfirm = () => {
    if (props.onConfirm != null) {
      props.onConfirm();
    }
  };

  return (
    <Modal isOpen={props.isModalOpen} toggle={onCancel} className="">
      <ModalHeader tag="h4" toggle={onCancel} className="bg-warning">
        <i className="icon-fw icon-question" />
        Warning
      </ModalHeader>
      <ModalBody>
        {t('admin:v5_page_migration.modal_migration_warning')}
        <br />
        <br />
        <span className="text-danger">
          <i className="icon-exclamation icon-fw"></i>
          {t('admin:v5_page_migration.migration_note')}
        </span>
      </ModalBody>
      <ModalFooter>
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
          onClick={onConfirm}
        >
          {t('admin:v5_page_migration.start_upgrading')}
        </button>
      </ModalFooter>
    </Modal>
  );
};
