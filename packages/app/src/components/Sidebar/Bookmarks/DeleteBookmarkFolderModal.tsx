
import React from 'react';

import { useTranslation } from 'next-i18next';
import {
  Modal, ModalBody, ModalFooter, ModalHeader,
} from 'reactstrap';

import FolderIcon from '~/components/Icons/FolderIcon';
import { BookmarkFolderItems } from '~/interfaces/bookmark-info';

type DeleteBookmarkFolderModalProps = {
  isOpen: boolean
  bookmarkFolder: BookmarkFolderItems
  onClickDeleteButton: () => void
  onModalClose: () => void
}

const DeleteBookmarkFolderModal = (props: DeleteBookmarkFolderModalProps): JSX.Element => {
  const { t } = useTranslation();
  const {
    isOpen, onClickDeleteButton, bookmarkFolder, onModalClose,
  } = props;

  return (
    <Modal size="md" isOpen={isOpen} toggle={onModalClose} data-testid="page-delete-modal" className="grw-create-page">
      <ModalHeader tag="h4" toggle={onModalClose} className="bg-danger text-light">
        <i className="icon-fw icon-trash"></i>
        {t('Delete Bookmark Folder')}
      </ModalHeader>
      <ModalBody>
        <div className="form-group pb-1">
          <label>{ t('Delete this bookmark folder and its contents') }:</label><br />
          <FolderIcon isOpen={false}/> {bookmarkFolder.name}
        </div>
        {t('Deleted folder and its contents cannot be recovered')}
      </ModalBody>
      <ModalFooter>
        <button
          type="button"
          className="btn btn-danger"
          onClick={onClickDeleteButton}
        >
          <i className="mr-1 icon-trash" aria-hidden="true"></i>
          {t('Delete Folder')}
        </button>
      </ModalFooter>
    </Modal>

  );
};

export default DeleteBookmarkFolderModal;
