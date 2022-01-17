import React, { useState, FC } from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { useTranslation } from 'react-i18next';

export type IPageForPageDeleteModal = {
  pageId: string,
  revisionId: string,
  path: string
}


type Props = {
  isOpen: boolean,
  pages: IPageForPageDeleteModal[],
  onClose?: () => void,
}
// TODO : migration modal : https://redmine.weseek.co.jp/issues/84858
const PageMigrateModal: FC<Props> = (props: Props) => {
  const { t } = useTranslation('');
  const {
    isOpen, onClose, pages,
  } = props;


  return (
    <Modal size="lg" isOpen={isOpen} toggle={onClose} className="grw-create-page">
      <ModalHeader tag="h4" toggle={onClose}>
        <h1>not implemented yet</h1>
      </ModalHeader>
      <ModalBody>
      </ModalBody>
      <ModalFooter>
      </ModalFooter>
    </Modal>
  );
};

export default PageMigrateModal;
