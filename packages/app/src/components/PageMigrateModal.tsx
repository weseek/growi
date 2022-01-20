import React, { useState, FC, useCallback } from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { useTranslation } from 'react-i18next';
import ApiErrorMessageList from './PageManagement/ApiErrorMessageList';

export type IPageForPageMigrateModal = {
  pageId: string,
  revisionId: string,
  path: string
}


type Props = {
  isOpen: boolean,
  pages: IPageForPageMigrateModal[],
  onClose?: () => void,
}
const PageMigrateModal: FC<Props> = (props: Props) => {
  const { t } = useTranslation('');
  const {
    isOpen, onClose, pages,
  } = props;

  const [isMigrateRecursively, setIsDeleteRecursively] = useState(true);
  const [errs, setErrs] = useState(null);

  const migratePage = async() => {
    // TODO : https://redmine.weseek.co.jp/issues/84857
    alert('Migrate page run!');
  };

  const migrateButtonHandler = async() => {
    migratePage();
  };

  const chnageIsMigrateRecursivelyHandler = useCallback(() => {
    setIsDeleteRecursively(prev => !prev);
  }, [setIsDeleteRecursively]);

  const renderMigrateRecursivelyForm = useCallback(() => {
    return (
      <div className="custom-control custom-checkbox custom-checkbox-warning">
        <input
          className="custom-control-input"
          id="migrateRecursively"
          type="checkbox"
          checked={isMigrateRecursively}
          onChange={chnageIsMigrateRecursivelyHandler}
        />
        <label className="custom-control-label" htmlFor="migrateRecursively">
          { t('modal_migrate.migrate_recursively') }
        </label>
      </div>
    );
  }, [chnageIsMigrateRecursivelyHandler, isMigrateRecursively]);


  return (
    <Modal size="lg" isOpen={isOpen} toggle={onClose} className="grw-create-page">
      <ModalHeader tag="h4" toggle={onClose} className="bg-primary text-light">
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
        {renderMigrateRecursivelyForm()}
      </ModalBody>
      <ModalFooter>
        <ApiErrorMessageList errs={errs} />
        <button type="button" className="btn btn-primary" onClick={migrateButtonHandler}>
          { t('modal_migrate.migrating_page') }
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default PageMigrateModal;
