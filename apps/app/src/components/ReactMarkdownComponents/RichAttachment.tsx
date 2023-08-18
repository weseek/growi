import { memo, useCallback } from 'react';

import { UserPicture } from '@growi/ui/dist/components';
import { useTranslation } from 'next-i18next';
import pdfWorker from 'pdfjs-dist/build/pdf.worker';
import pdfWorkerMin from 'pdfjs-dist/build/pdf.worker.min';
import prettyBytes from 'pretty-bytes';
import { pdfjs, Document, Page } from 'react-pdf';

// see: https://github.com/wojtekmaj/react-pdf#support-for-annotations
import 'react-pdf/dist/cjs/Page/AnnotationLayer.css';
// see: https://github.com/wojtekmaj/react-pdf#support-for-text-layer
import 'react-pdf/dist/cjs/Page/TextLayer.css';
import { useSWRxAttachment } from '~/stores/attachment';
import { useDeleteAttachmentModal, usePdfPreviewModal } from '~/stores/modal';

import styles from './RichAttachment.module.scss';

// see: https://zenn.dev/kin/articles/658b06a3233e60#react-pdf%E5%88%9D%E6%9C%9F%E8%A8%AD%E5%AE%9A
const workerPath = process.env.NODE_ENV === 'production'
  ? pdfWorkerMin
  : pdfWorker;
pdfjs.GlobalWorkerOptions.workerSrc = workerPath;

const options = {
  cMapUrl: '../media/cmaps/',
  standardFontDataUrl: '../media/standard_fonts/',
};

interface RichAttachmentProps {
  attachmentId: string,
  url: string,
  attachmentName: string
}

export const RichAttachment = memo(({ attachmentId, url, attachmentName }: RichAttachmentProps) => {
  const { t } = useTranslation();
  const { data: attachment, remove } = useSWRxAttachment(attachmentId);
  const { open: openDeleteAttachmentModal } = useDeleteAttachmentModal();
  const { open: openPdfPreviewModal } = usePdfPreviewModal();

  const onClickPdfPreviewHandler = useCallback(() => {
    openPdfPreviewModal(url, options);
  }, [openPdfPreviewModal, url]);

  const onClickTrashButtonHandler = useCallback(() => {
    if (attachment == null) {
      return;
    }
    openDeleteAttachmentModal(attachment, remove);
  }, [attachment, openDeleteAttachmentModal, remove]);

  if (attachment == null) {
    return <span className="text-muted">{t('rich_attachment.attachment_not_be_found')}</span>;
  }

  const {
    filePathProxied,
    originalName,
    downloadPathProxied,
    creator,
    createdAt,
    fileSize,
    fileFormat,
  } = attachment;

  // Guard here because attachment properties might be deleted in turn when an attachment is removed
  if (filePathProxied == null
    || originalName == null
    || downloadPathProxied == null
    || creator == null
    || createdAt == null
    || fileSize == null
    || fileFormat == null
  ) {
    return <span className="text-muted">{t('rich_attachment.attachment_not_be_found')}</span>;
  }

  // TODO: Do not use css hard code, check RichAttachment.scss
  // https://redmine.weseek.co.jp/issues/128793
  // TODO: Apply expand icon
  // https://redmine.weseek.co.jp/issues/128791
  // TODO: Apply pdf icon
  // https://redmine.weseek.co.jp/issues/125542
  // TODO: Apply cursor
  // https://redmine.weseek.co.jp/issues/128790
  // TODO: Apply responsive design
  // https://redmine.weseek.co.jp/issues/128794
  return (
    <div className={`${styles.attachment} d-inline-block`}>
      <div className="my-2 card">
        {fileFormat === 'application/pdf' && (
          <div className="custom-shadow" onClick={onClickPdfPreviewHandler}>
            <Document file={url} options={options} className="d-flex justify-content-center">
              <Page pageNumber={1} scale={0.5} />
            </Document>
          </div>
        )}
        <div className="p-2 card-body d-flex align-items-center">
          <div className="mr-2 px-0">
            <img alt="attachment icon" src="/images/icons/editor/attachment.svg" className="attachment-icon" />
          </div>
          <div className="pl-0">
            <div>
              <a target="_blank" rel="noopener noreferrer" href={filePathProxied}>
                {attachmentName || originalName}
              </a>
              <a className="ml-2 attachment-download" href={downloadPathProxied}>
                <i className="icon-cloud-download" />
              </a>
              <a className="ml-2 text-danger attachment-delete" onClick={onClickTrashButtonHandler}>
                <i className="icon-trash" />
              </a>
            </div>
            <div>
              <UserPicture user={creator} size="sm" />
              <span className="ml-2 text-muted">
                {new Date(createdAt).toLocaleString('en-US')}
              </span>
              <span className="ml-2 pl-2 border-left text-muted">{prettyBytes(fileSize)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
RichAttachment.displayName = 'RichAttachment';
