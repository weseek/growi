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

  const migratePage = async() => {
    alert('Migrate page run!');
  };

  const migrateButtonHandler = async() => {
    migratePage();
  };


  return (
    <Modal size="lg" isOpen={isOpen} toggle={onClose} className="grw-create-page">
      <ModalHeader tag="h4" toggle={onClose} className="bg-primary text-light">
        <i className="">
          {/* icon if requested */}
        </i>
        {t('V5 Page Migration')}
      </ModalHeader>
      <ModalBody>
        <div className="form-group grw-scrollable-modal-body pb-1">
          <label>{t('modal_migrate.migrating_page')}:</label><br />
          {/* Todo: change the way to show path on modal when too many pages are selected */}
          {/* https://redmine.weseek.co.jp/issues/82787 */}
          {pages.map((page) => {
            return <div key={page.pageId}><code>{ page.path }</code></div>;
          })}
        </div>
      </ModalBody>
      <ModalFooter>

      </ModalFooter>
    </Modal>
  );
};

export default PageMigrateModal;
