import React, { useMemo, useCallback } from 'react';

import type { HasObjectId, IAttachment } from '@growi/core';
import { UserPicture } from '@growi/ui';
import prettyBytes from 'pretty-bytes';

import { useSWRxAttachments } from '~/stores/attachment';
import { useAttachmentDeleteModal } from '~/stores/modal';
import { useCurrentPageId } from '~/stores/page';

export const Attachment: React.FC<{
  attachmentId: string,
  url: string,
  attachmentName: string
}> = React.memo(({ attachmentId, url, attachmentName }) => {
  const { data: pageId } = useCurrentPageId();
  // TODO: We need to be able to get it from all pages if there are a lot of attachments.
  const { data: dataAttachments, remove } = useSWRxAttachments(pageId, 1);
  const { open: openAttachmentDeleteModal } = useAttachmentDeleteModal();

  const attachment = useMemo(() => {
    if (dataAttachments == null) {
      return;
    }
    return dataAttachments.attachments.find(item => item._id === attachmentId);
  }, [attachmentId, dataAttachments]);

  const onAttachmentDeleteClicked = useCallback((attachment: IAttachment & HasObjectId) => {
    openAttachmentDeleteModal(attachment, remove);
  }, [openAttachmentDeleteModal, remove]);

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
              <a className='' href={attachment.downloadPathProxied}>{attachment.originalName}</a>
              <span className='ml-2'>
                <a className="attachment-download" href={attachment.downloadPathProxied}>
                  <i className="icon-cloud-download" />
                </a>
              </span>
              <span className='ml-2'>
                <a className="text-danger attachment-delete" onClick={() => onAttachmentDeleteClicked(attachment)}>
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
