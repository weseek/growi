import React, { useCallback } from 'react';

import { UserPicture } from '@growi/ui/dist/components';
import { useTranslation } from 'next-i18next';
import prettyBytes from 'pretty-bytes';

import { useSWRxAttachment } from '~/stores/attachment';
import { useDeleteAttachmentModal } from '~/stores/modal';

import styles from './RichAttachment.module.scss';

type RichAttachmentProps = {
  attachmentId: string,
  url: string,
  attachmentName: string,
  isSharedPage: 'true' | 'false',
}

export const RichAttachment = React.memo((props: RichAttachmentProps) => {
  const { attachmentId, attachmentName, isSharedPage } = props;
  const { t } = useTranslation();
  const { data: attachment, remove } = useSWRxAttachment(attachmentId);
  const { open: openDeleteAttachmentModal } = useDeleteAttachmentModal();

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
  } = attachment;

  // Guard here because attachment properties might be deleted in turn when an attachment is removed
  if (filePathProxied == null
    || originalName == null
    || downloadPathProxied == null
    || creator == null
    || createdAt == null
    || fileSize == null
  ) {
    return <span className="text-muted">{t('rich_attachment.attachment_not_be_found')}</span>;
  }

  return (
    <div className={`${styles.attachment} d-inline-block`}>
      <div className="my-2 p-2 card">
        <div className="p-1 card-body d-flex align-items-center">
          <div className="mr-2 px-0 d-flex align-items-center justify-content-center">
            <img src="/images/icons/editor/attachment.svg" className="attachment-icon" alt="attachment icon" />
          </div>
          <div className="pl-0">
            <div className="d-inline-block">
              {/* Since we need to include the "referer" to view the attachment on the shared page */}
              {/* eslint-disable-next-line react/jsx-no-target-blank */}
              <a target="_blank" rel="noopener" href={filePathProxied}>
                {attachmentName || originalName}
              </a>
              <a className="ml-2 attachment-download" href={downloadPathProxied}>
                <i className="icon-cloud-download" />
              </a>
              {isSharedPage === 'false' && (
                <a className="ml-2 text-danger attachment-delete" onClick={onClickTrashButtonHandler}>
                  <i className="icon-trash" />
                </a>
              )}
            </div>
            <div className="d-flex align-items-center">
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
