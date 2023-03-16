import React, { useCallback, useMemo } from 'react';

import { HasObjectId, IAttachment } from '@growi/core';
import { UserPicture } from '@growi/ui';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { Username } from '../User/Username';

import styles from './DeleteAttachmentModal.module.scss';

const iconByFormat = (format: string): string => {
  return format.match(/image\/.+/i) ? 'icon-picture' : 'icon-doc';
};

export const AttachmentDeleteModal: React.FC<{
  isOpen: boolean,
  toggle: () => void,
  attachmentToDelete: IAttachment & HasObjectId,
  deleting: boolean,
  deleteError: string,
  onAttachmentDeleteHandler: (attachment: IAttachment & HasObjectId) => Promise<void>,
}> = ({
  isOpen, toggle,
  attachmentToDelete, deleting, deleteError,
  onAttachmentDeleteHandler,
}) => {

  const onDeleteClicked = useCallback(() => {
    onAttachmentDeleteHandler(attachmentToDelete);
  }, [attachmentToDelete, onAttachmentDeleteHandler]);

  const renderByFileFormat = useCallback((attachment: IAttachment & HasObjectId) => {
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
          uploaded by <UserPicture user={attachment.creator} size="sm"></UserPicture> <Username user={attachment.creator}></Username>
        </p>
        {content}
      </div>
    );
  }, []);

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
      <ModalHeader tag="h4" toggle={toggle} className="bg-danger text-light">
        <span id="contained-modal-title-lg">Delete attachment?</span>
      </ModalHeader>
      <ModalBody>
        {renderByFileFormat(attachmentToDelete)}
      </ModalBody>
      <ModalFooter>
        <div className="mr-3 d-inline-block">
          {deletingIndicator}
        </div>
        <Button
          color="danger"
          onClick={onDeleteClicked}
          disabled={deleting}
        >Delete!
        </Button>
      </ModalFooter>
    </Modal>
  );
};
