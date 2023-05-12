import React, { useCallback } from 'react';

import { UserPicture } from '@growi/ui/dist/components/User/UserPicture';
import prettyBytes from 'pretty-bytes';

import { useSWRxAttachment } from '~/stores/attachment';
import { useDeleteAttachmentModal } from '~/stores/modal';

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
    return (
      <span className='text-muted'>This attachment not found.</span>
    );
  }

  // TODO: locale support
  // TODO: User Picture Tooltip
  // TODO: Ensure that the card style does not collapse when d-inline-blocked

  return (
    <div className="card my-3">
      <div className="card-body py-1">
        <div className='row'>
          <div className='col-1 px-0 d-flex align-items-center justify-content-center'>
            <img src='/images/icons/editor/attachment.svg'/>
          </div>
          <div className='col-11 pl-0'>
            <div>
              <a target="_blank" rel="noopener noreferrer" href={attachment.filePathProxied}>{attachment.originalName}</a>
              <span className='ml-2'>
                <a className="attachment-download" href={attachment.downloadPathProxied}>
                  <i className="icon-cloud-download" />
                </a>
              </span>
              <span className='ml-2'>
                <a className="text-danger attachment-delete" onClick={onClickTrashButtonHandler}>
                  <i className="icon-trash" />
                </a>
              </span>
            </div>
            <div>
              <UserPicture user={attachment.creator} size="sm"></UserPicture>
              <span className='ml-2 text-muted'>{new Date(attachment.createdAt).toLocaleString('ja-JP')}</span>
              <span className='border-left ml-2 pl-2 text-muted'>{prettyBytes(attachment.fileSize)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
Attachment.displayName = 'Attachment';
