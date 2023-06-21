import React, { useCallback } from 'react';

import { UserPicture } from '@growi/ui/dist/components/User/UserPicture';
import prettyBytes from 'pretty-bytes';

import { useSWRxAttachment } from '~/stores/attachment';
import { useDeleteAttachmentModal } from '~/stores/modal';

import styles from './Attachment.module.scss';

export const Attachment: React.FC<{
  attachmentId: string,
  url: string,
  attachmentName: string
}> = React.memo(({ attachmentId, url, attachmentName }) => {
  const { data: attachment, remove } = useSWRxAttachment(attachmentId);
  const { open: openDeleteAttachmentModal } = useDeleteAttachmentModal();

  const onClickTrashButtonHandler = useCallback(() => {
    if (attachment == null) {
      return;
    }
    openDeleteAttachmentModal(attachment, remove);
  }, [attachment, openDeleteAttachmentModal, remove]);

  if (attachment == null) {
    return <span className='text-muted'>The attachment could not be found.</span>;
  }

  const {
    filePathProxied,
    originalName,
    downloadPathProxied,
    creator,
    createdAt,
    fileSize,
  } = attachment;

  return (
    <div className={`${styles.attachment} d-inline-block`}>
      <div className="my-2 p-2 card">
        <div className="p-1 card-body d-flex align-items-center">
          <div className='mr-2 px-0 d-flex align-items-center justify-content-center'>
            <img src='/images/icons/editor/attachment.svg' className="attachment-icon" alt='attachment icon'/>
          </div>
          <div className='pl-0'>
            <div className='d-inline-block'>
              <a target="_blank" rel="noopener noreferrer" href={filePathProxied}>
                {attachmentName || originalName}
              </a>
              <a className="ml-2 attachment-download" href={downloadPathProxied}>
                <i className="icon-cloud-download"/>
              </a>
              <a className="ml-2 text-danger attachment-delete" onClick={onClickTrashButtonHandler}>
                <i className="icon-trash"/>
              </a>
            </div>
            <div className='d-flex align-items-center'>
              <UserPicture user={creator} size="sm"/>
              <span className='ml-2 text-muted'>
                {new Date(createdAt).toLocaleString('en-US')}
              </span>
              <span className='ml-2 pl-2 border-left text-muted'>{prettyBytes(fileSize)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
Attachment.displayName = 'Attachment';
