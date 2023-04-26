import React, { useCallback } from 'react';

import { UserPicture } from '@growi/ui/dist/components/User/UserPicture';
import prettyBytes from 'pretty-bytes';

import { useSWRxAttachment } from '~/stores/attachment';
import { useAttachmentDeleteModal } from '~/stores/modal';

export const Attachment: React.FC<{
  attachmentId: string,
  url: string,
  attachmentName: string
}> = React.memo(({ attachmentId, url, attachmentName }) => {
  const { data: attachment, remove } = useSWRxAttachment(attachmentId);
  const { open: openAttachmentDeleteModal } = useAttachmentDeleteModal();
  const onClickTrashButtonHandler = useCallback(() => {
    if (attachment == null) {
      return;
    }
    openAttachmentDeleteModal(attachment, remove);
  }, [attachment, openAttachmentDeleteModal, remove]);

  if (attachment == null) {
    return (
      <span className='text-muted'>This attachment not found.</span>
    );
  }

  return (
    <div className="card my-3" style={{ width: 'fit-content' }}>
      <div className="card-body pr-0">
        <div className='row'>
          <div className='col-2'>
            <div className='icon-doc' style={{ fontSize: '2.7rem', opacity: '0.5' }}/>
          </div>
          <div className='col-10'>
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
              {/* TODO: check locale */}
              <span className='ml-2 text-muted'>{new Date(attachment.createdAt).toLocaleString()}</span>
              <span className='border-left ml-2 pl-2 text-muted'>{prettyBytes(attachment.fileSize)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
Attachment.displayName = 'Attachment';
