import React, {
  useCallback, useMemo, useState,
} from 'react';

import type { IUser } from '@growi/core';
import { UserPicture } from '@growi/ui/dist/components/User/UserPicture';
import { useTranslation } from 'next-i18next';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { toastSuccess, toastError } from '~/client/util/toastr';
import { useDeleteAttachmentModal } from '~/stores/modal';
import loggerFactory from '~/utils/logger';

import { Username } from '../User/Username';

import styles from './DeleteAttachmentModal.module.scss';

const logger = loggerFactory('growi:attachmentDelete');

const iconByFormat = (format: string): string => {
  return format.match(/image\/.+/i) ? 'icon-picture' : 'icon-doc';
};

export const DeleteAttachmentModal: React.FC = () => {
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string>('');

  const { t } = useTranslation();
  const { data: deleteAttachmentModal, close: closeDeleteAttachmentModal } = useDeleteAttachmentModal();
  const isOpen = deleteAttachmentModal?.isOpened;
  const attachment = deleteAttachmentModal?.attachment;
  const remove = deleteAttachmentModal?.remove;

  const toggleHandler = useCallback(() => {
    closeDeleteAttachmentModal();
    setDeleting(false);
    setDeleteError('');
  }, [closeDeleteAttachmentModal]);

  const onClickDeleteButtonHandler = useCallback(async() => {
    if (remove == null || attachment == null) {
      return;
    }

    setDeleting(true);

    try {
      await remove({ attachment_id: attachment._id });
      setDeleting(false);
      closeDeleteAttachmentModal();
      toastSuccess(`Delete ${attachment.originalName}`);
    }
    catch (err) {
      setDeleting(false);
      setDeleteError('Attachment could not be deleted.');
      toastError(err);
      logger.error(err);
    }
  }, [attachment, closeDeleteAttachmentModal, remove]);

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
        <span id="contained-modal-title-lg">{t('delete_attachment_modal.confirm_delete_attachment')}</span>
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
        >{t('commons:Delete')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
