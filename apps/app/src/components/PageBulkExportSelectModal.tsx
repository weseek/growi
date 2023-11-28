import { useTranslation } from 'next-i18next';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import { usePageBulkExportSelectModal } from '~/stores/modal';

const PageBulkExportSelectModal = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: status, close } = usePageBulkExportSelectModal();

  return (
    <>
      {status != null && (
        <Modal isOpen={status.isOpened} toggle={close}>
          <ModalHeader tag="h4" toggle={close} className="bg-primary text-light">
            {t('page_export.bulk_export')}
          </ModalHeader>
          <ModalBody>
            <div className="mb-2">
              <small className="text-muted">
                {t('page_export.bulk_export_notice')}
              </small>
            </div>
            {t('page_export.choose_export_format')}:
            <div className="d-flex justify-content-center mt-2">
              <button className="btn btn-primary" type="button">{t('page_export.markdown')}</button>
              <button className="btn btn-primary ml-2" type="button">PDF</button>
            </div>
          </ModalBody>
        </Modal>
      )}
    </>
  );
};

export default PageBulkExportSelectModal;
