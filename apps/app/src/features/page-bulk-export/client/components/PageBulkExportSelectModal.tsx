import { useState } from 'react';

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

  const [isRestartModalOpened, setIsRestartModalOpened] = useState(false);
  const [formatMemoForRestart, setFormatMemoForRestart] = useState<PageBulkExportFormat | undefined>(undefined);
  const [duplicateJobInfo, setDuplicateJobInfo] = useState<{createdAt: string} | undefined>(undefined);

  const startBulkExport = async(format: PageBulkExportFormat) => {
    try {
      setFormatMemoForRestart(format);
      await apiv3Post('/page-bulk-export', { path: currentPagePath, format });
      toastSuccess(t('page_export.bulk_export_started'));

      // setDuplicateJob({ createdAt: new Date(), format } as any);
      // setIsRestartModalOpened(true);
    }
    catch (e) {
      const errorCode = e?.[0].code ?? 'page_export.failed_to_export';
      if (errorCode === 'page_export.duplicate_bulk_export_job_error') {
        setDuplicateJobInfo(e[0].args.duplicateJob);
        setIsRestartModalOpened(true);
      }
      else {
        toastError(t(errorCode));
      }
    }
    close();
  };

  const restartBulkExport = async() => {
    if (formatMemoForRestart != null) {
      try {
        await apiv3Post('/page-bulk-export', { path: currentPagePath, format: formatMemoForRestart, restartJob: true });
        toastSuccess(t('page_export.bulk_export_started'));
      }
      catch (e) {
        toastError(t('page_export.failed_to_export'));
      }
      setIsRestartModalOpened(false);
    }
  };

  const formatStartDate = (createdAt: string) => {
    const date = new Date(createdAt);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');

    return `${mm}/${dd} ${hh}:${min}`;
  };

  return (
    <>
      {status != null && (
        <Modal isOpen={status.isOpened} toggle={close}>
          <ModalHeader tag="h4" toggle={close}>
            {t('page_export.bulk_export')}
          </ModalHeader>
          <ModalBody>
            {t('page_export.choose_export_format')}
            <div className="my-1">
              <small className="text-muted">
                {t('page_export.bulk_export_notice')}
              </small>
            </div>
            <div className="d-flex justify-content-center mt-3">
              <button className="btn btn-primary" type="button" onClick={() => startBulkExport(PageBulkExportFormat.md)}>
                {t('page_export.markdown')}
              </button>
              {/* TODO: enable in https://redmine.weseek.co.jp/issues/135772 */}
              {/* <button className="btn btn-primary ms-2" type="button" onClick={() => startBulkExport(PageBulkExportFormat.pdf)}>PDF</button> */}
            </div>
          </ModalBody>
        </Modal>
      )}

      <Modal isOpen={isRestartModalOpened} toggle={() => setIsRestartModalOpened(false)}>
        <ModalHeader tag="h4" toggle={() => setIsRestartModalOpened(false)}>
          {t('page_export.export_in_progress')}
        </ModalHeader>
        <ModalBody>
          {t('page_export.export_in_progress_explanation')}
          <div className="text-danger">
            {t('page_export.export_cancel_warning')}:
          </div>
          { duplicateJobInfo && (
            <div className="my-1">
              <ul>
                { formatMemoForRestart && (
                  <li>
                    {t('page_export.format')}: {formatMemoForRestart === PageBulkExportFormat.md ? t('page_export.markdown') : 'PDF'}
                  </li>
                )}
                <li>{t('page_export.started_on')}: {formatStartDate(duplicateJobInfo.createdAt)}</li>
              </ul>
            </div>
          )}
          <div className="d-flex justify-content-center mt-3">
            <button className="btn btn-primary" type="button" onClick={() => restartBulkExport()}>
              {t('page_export.restart')}
            </button>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default PageBulkExportSelectModal;
