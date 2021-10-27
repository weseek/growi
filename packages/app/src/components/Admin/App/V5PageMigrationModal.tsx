import React, { FC } from 'react';
import PropTypes from 'prop-types';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { useTranslation } from 'react-i18next';

type V5PageMigrationModalProps = {
  isModalOpen: boolean
  onConfirm: () => Promise<void>;
  onCancel: () => void;
};

export const V5PageMigrationModal: FC<V5PageMigrationModalProps> = (props) => {
  const { t } = useTranslation();

  const onCancel = () => {
    props.onCancel();
  };

  return (
    <Modal isOpen={props.isModalOpen} toggle={onCancel} className="">
      <ModalHeader tag="h4" toggle={onCancel} className="bg-warning">
        <i className="icon-fw icon-question" />
        Warning
      </ModalHeader>
      <ModalBody>
        {t('v5_page_migration.modal_migration_warning')}
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
          onClick={props.onConfirm}
        >
          {t('v5_page_migration.start_upgrading')}
        </button>
      </ModalFooter>
    </Modal>
  );
};

V5PageMigrationModal.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
