import { useTranslation } from 'next-i18next';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import { apiv3Post } from '~/client/util/apiv3-client';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { usePageBulkExportSelectModal } from '~/features/page-bulk-export/client/stores/modal';
import { PageBulkExportFormat } from '~/features/page-bulk-export/interfaces/page-bulk-export';
import { useCurrentPagePath } from '~/stores/page';

const PageBulkExportSelectModal = (): JSX.Element => {
  const { t } = useTranslation();
  const { data: status, close } = usePageBulkExportSelectModal();
  const { data: currentPagePath } = useCurrentPagePath();

  const startBulkExport = async(format: PageBulkExportFormat) => {
    try {
      await apiv3Post('/page-bulk-export', { path: currentPagePath, format });
      toastSuccess(t('page_export.bulk_export_started'));
    }
    catch (e) {
      // TODO: Enable cancel and restart of export if duplicate export exists (https://redmine.weseek.co.jp/issues/150418)
      const errorCode = e?.[0].code ?? 'page_export.failed_to_export';
      toastError(t(errorCode));
    }
    close();
  };

  return (
    <>
      {status != null && (
        <Modal isOpen={status.isOpened} toggle={close}>
          <ModalHeader tag="h5" toggle={close} className="bg-primary text-light">
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
              <button className="btn btn-primary" type="button" onClick={() => startBulkExport(PageBulkExportFormat.md)}>
                {t('page_export.markdown')}
              </button>
              <button className="btn btn-primary ms-2" type="button" onClick={() => startBulkExport(PageBulkExportFormat.pdf)}>PDF</button>
            </div>
          </ModalBody>
        </Modal>
      )}
    </>
  );
};

export default PageBulkExportSelectModal;
