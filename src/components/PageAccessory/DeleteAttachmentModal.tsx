import { VFC } from 'react';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { Attachment } from '~/interfaces/page';

import UserPicture from '../../client/js/components/User/UserPicture';
import { Username } from '~/components/User/Username';

type Props = {
  isOpen: boolean,
  onClose: () => void,
  attachmentToDelete: Attachment,
  isDeleting: boolean,
  deleteErrorMessage?: string,
  onDeleteAttachment?: () => void,
};


export const DeleteAttachmentModal:VFC<Props> = (props: Props) => {
  const {
    attachmentToDelete, isDeleting, deleteErrorMessage, onDeleteAttachment,
  } = props;

  const handleDeleteButton = () => {
    if (onDeleteAttachment != null) {
      onDeleteAttachment();
    }
  };

  return (
    <Modal
      isOpen={props.isOpen}
      toggle={props.onClose}
      animation="false"
      className="attachment-delete-modal"
      bssize="large"
      aria-labelledby="contained-modal-title-lg"
    >
      <ModalHeader tag="h4" toggle={props.onClose} className="bg-danger text-light">
        <span id="contained-modal-title-lg">Delete attachment?</span>
      </ModalHeader>
      <ModalBody>
        <div className="attachment-delete-image">
          <p>
            <i className={(attachmentToDelete.fileFormat.match(/image\/.+/i)) ? 'icon-picture' : 'icon-doc'} />{' '}
            {attachmentToDelete.originalName}
          </p>
          <p>
            uploaded by{' '}
            <UserPicture user={attachmentToDelete.creator} size="sm" />{' '}
            <Username user={attachmentToDelete.creator} />
          </p>
          {(attachmentToDelete.fileFormat.match(/image\/.+/i)) && <img src={attachmentToDelete.filePathProxied} alt="deleting image" />}
        </div>
      </ModalBody>
      <ModalFooter>
        <div className="mr-3 d-inline-block">
          {isDeleting && <div className="speeding-wheel-sm" />}
          {deleteErrorMessage != null && <span>{deleteErrorMessage}</span>}
        </div>
        <button
          type="button"
          className="btn btn-danger"
          onClick={handleDeleteButton}
          disabled={isDeleting}
        >
          Delete!
        </button>
      </ModalFooter>
    </Modal>
  );
};
