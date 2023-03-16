import React, { useMemo, useCallback, useState } from 'react';

import { HasObjectId, IAttachment } from '@growi/core';
import { UserPicture } from '@growi/ui';
import prettyBytes from 'pretty-bytes';

import { toastSuccess, toastError } from '~/client/util/toastr';
import { AttachmentDeleteModal } from '~/components/PageAttachment/AttachmentDeleteModal';
import { useSWRxAttachments } from '~/stores/attachment';
import { useAttachmentDeleteModal } from '~/stores/modal';
import { useCurrentPageId } from '~/stores/page';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:attachmentDelete');

export const Attachment: React.FC<{
  attachmentId: string,
  url: string,
  attachmentName: string
}> = React.memo(({ attachmentId, url, attachmentName }) => {
  const { data: pageId } = useCurrentPageId();
  // TODO: We need to be able to get it from all pages if there are a lot of attachments.
  const { data: dataAttachments, remove } = useSWRxAttachments(pageId, 1);
  const { data: attachmentDeleteModal, open: openAttachmentDeleteModal, close: closeAttachmentDeleteModal } = useAttachmentDeleteModal();
  const [attachmentToDelete, setAttachmentToDelete] = useState<(IAttachment & HasObjectId) | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string>('');

  const attachment = useMemo(() => {
    if (dataAttachments == null) {
      return;
    }
    return dataAttachments.attachments.find(item => item._id === attachmentId);
  }, [attachmentId, dataAttachments]);

  const onAttachmentDeleteClicked = useCallback((attachment: IAttachment & HasObjectId) => {
    setAttachmentToDelete(attachment);
    openAttachmentDeleteModal();
  }, [openAttachmentDeleteModal]);

  const onToggleHandler = useCallback(() => {
    setAttachmentToDelete(null);
    setDeleteError('');
  }, []);

  const onAttachmentDeleteHandler = useCallback(async(attachment: IAttachment & HasObjectId) => {
    setDeleting(true);

    try {
      await remove({ attachment_id: attachment._id });
      setAttachmentToDelete(null);
      setDeleting(false);
      closeAttachmentDeleteModal();
      toastSuccess(`Delete ${attachmentName}`);
    }
    catch (err) {
      setDeleteError('Something went wrong.');
      closeAttachmentDeleteModal();
      toastError(err);
      logger.error(err);
    }
  }, [attachmentName, closeAttachmentDeleteModal, remove]);

  if (attachment == null) {
    return (
      <span className='text-muted'>This attachment not found.</span>
    );
  }

  return (
    <>
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

      {/* TODO: move rendering position */}
      {attachmentToDelete != null && (
        <AttachmentDeleteModal
          isOpen={attachmentDeleteModal?.isOpened || false}
          toggle={onToggleHandler}
          attachmentToDelete={attachmentToDelete}
          deleting={deleting}
          deleteError={deleteError}
          onAttachmentDeleteHandler={onAttachmentDeleteHandler}
        />
      )}
    </>
  );
});
Attachment.displayName = 'Attachment';
