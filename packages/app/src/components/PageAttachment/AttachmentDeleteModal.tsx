import React, {
  useCallback, useMemo, useState,
} from 'react';

import type { IUser } from '@growi/core';
import { UserPicture } from '@growi/ui';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { toastSuccess, toastError } from '~/client/util/toastr';
import { useAttachmentDeleteModal } from '~/stores/modal';
import loggerFactory from '~/utils/logger';

import { Username } from '../User/Username';

import styles from './DeleteAttachmentModal.module.scss';

const logger = loggerFactory('growi:attachmentDelete');

const iconByFormat = (format: string): string => {
  return format.match(/image\/.+/i) ? 'icon-picture' : 'icon-doc';
};

export const AttachmentDeleteModal: React.FC = () => {
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string>('');

  const { data: attachmentDeleteModal, close: closeAttachmentDeleteModal } = useAttachmentDeleteModal();
  const isOpen = attachmentDeleteModal?.isOpened;
  const attachment = attachmentDeleteModal?.attachment;
  const remove = attachmentDeleteModal?.remove;

  const toggleHandler = useCallback(() => {
    closeAttachmentDeleteModal();
    setDeleting(false);
    setDeleteError('');
  }, [closeAttachmentDeleteModal]);

  const onClickDeleteButtonHandler = useCallback(async() => {
    if (remove == null || attachment == null) {
      return;
    }

    setDeleting(true);

    try {
      await remove({ attachment_id: attachment._id });
      setDeleting(false);
      closeAttachmentDeleteModal();
      toastSuccess(`Delete ${attachment.originalName}`);
    }
    catch (err) {
      setDeleting(false);
      setDeleteError('Something went wrong.');
      toastError(err);
      logger.error(err);
    }
  }, [attachment, closeAttachmentDeleteModal, remove]);

  const attachmentFileFormat = useMemo(() => {
    if (attachment == null) {
      return;
    }

    const content = (attachment.fileFormat.match(/image\/.+/i))
      // eslint-disable-next-line @next/next/no-img-element
      ? <img src={attachment.filePathProxied} alt="deleting image" />
      : '';

    return (
      <div className="attachment-delete-image">
        <p>
          <i className={iconByFormat(attachment.fileFormat)}></i> {attachment.originalName}
        </p>
        <p>
          uploaded by <UserPicture user={attachment.creator} size="sm"></UserPicture> <Username user={attachment.creator as IUser}></Username>
        </p>
        {content}
      </div>
    );
  }, [attachment]);

  const deletingIndicator = useMemo(() => {
    if (deleting) {
      return <div className="speeding-wheel-sm"></div>;
    }
    if (deleteError) {
      return <span>{deleteError}</span>;
    }
    return <></>;
  }, [deleting, deleteError]);

  return (
    <Modal
      isOpen={isOpen}
      className={`${styles['attachment-delete-modal']} attachment-delete-modal`}
      size="lg"
      aria-labelledby="contained-modal-title-lg"
      fade={false}
    >
      <ModalHeader tag="h4" toggle={toggleHandler} className="bg-danger text-light">
        <span id="contained-modal-title-lg">Delete attachment?</span>
      </ModalHeader>
      <ModalBody>
        {attachmentFileFormat}
      </ModalBody>
      <ModalFooter>
        <div className="mr-3 d-inline-block">
          {deletingIndicator}
        </div>
        <Button
          color="danger"
          onClick={onClickDeleteButtonHandler}
          disabled={deleting}
        >Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};
