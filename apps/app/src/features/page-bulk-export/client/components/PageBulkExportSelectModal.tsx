import { useTranslation } from 'next-i18next';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import { toastSuccess } from '~/client/util/toastr';
import { usePageBulkExportSelectModal } from '~/stores/modal';

const PageBulkExportSelectModal = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: status, close } = usePageBulkExportSelectModal();

  const startBulkExport = () => {
    close();
    toastSuccess(t('page_export.bulk_export_started'));
  };

  return (
    <>
      {status != null && (
        <Modal isOpen={status.isOpened} toggle={close}>
          <ModalHeader tag="h4" toggle={close} className="bg-primary text-light">
            {t('page_export.bulk_export')}
          </ModalHeader>
          <ModalBody>
            {t('page_export.choose_export_format')}
            <div className="my-2">
              <small className="text-muted">
                {t('page_export.bulk_export_notice')}
              </small>
            </div>
            <div className="d-flex justify-content-center mt-2">
              <button className="btn btn-primary" type="button" onClick={startBulkExport}>{t('page_export.markdown')}</button>
              <button className="btn btn-primary ml-2" type="button" onClick={startBulkExport}>PDF</button>
            </div>
          </ModalBody>
        </Modal>
      )}
    </>
  );
};

export default PageBulkExportSelectModal;
