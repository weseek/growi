/* eslint-disable react/prop-types */
import React, { useCallback } from 'react';

import { HasObjectId, IAttachment } from '@growi/core';
import { UserPicture } from '@growi/ui/dist/components/User/UserPicture';
import Button from 'reactstrap/es/Button';
import Modal from 'reactstrap/es/Modal';
import ModalBody from 'reactstrap/es/ModalBody';
import ModalFooter from 'reactstrap/es/ModalFooter';
import ModalHeader from 'reactstrap/es/ModalHeader';

import { Username } from '../User/Username';

import styles from './DeleteAttachmentModal.module.scss';


function iconNameByFormat(format: string): string {
  if (format.match(/image\/.+/i)) {
    return 'icon-picture';
  }

  return 'icon-doc';
}


type Props = {
  isOpen: boolean,
  toggle: () => void,
  attachmentToDelete: IAttachment & HasObjectId | null,
  deleting: boolean,
  deleteError: string,
  onAttachmentDeleteClickedConfirm?: (attachment: IAttachment & HasObjectId) => Promise<void>,
}

export const DeleteAttachmentModal = (props: Props): JSX.Element => {

  const {
    isOpen, toggle,
    attachmentToDelete, deleting, deleteError,
    onAttachmentDeleteClickedConfirm,
  } = props;

  const onDeleteConfirm = useCallback(() => {
    if (attachmentToDelete == null || onAttachmentDeleteClickedConfirm == null) {
      return;
    }
    onAttachmentDeleteClickedConfirm(attachmentToDelete);
  }, [attachmentToDelete, onAttachmentDeleteClickedConfirm]);

  const renderByFileFormat = useCallback((attachment) => {
    const content = (attachment.fileFormat.match(/image\/.+/i))
      // eslint-disable-next-line @next/next/no-img-element
      ? <img src={attachment.filePathProxied} alt="deleting image" />
      : '';


    return (
      <div className="attachment-delete-image">
        <p>
          <i className={iconNameByFormat(attachment.fileFormat)}></i> {attachment.originalName}
        </p>
        <p>
          uploaded by <UserPicture user={attachment.creator} size="sm"></UserPicture> <Username user={attachment.creator}></Username>
        </p>
        {content}
      </div>
    );
  }, []);

  let deletingIndicator = <></>;
  if (deleting) {
    deletingIndicator = <div className="speeding-wheel-sm"></div>;
  }
  if (deleteError) {
    deletingIndicator = <span>{deleteError}</span>;
  }


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
          onClick={onDeleteConfirm}
          disabled={deleting}
        >Delete!
        </Button>
      </ModalFooter>
    </Modal>
  );

};
