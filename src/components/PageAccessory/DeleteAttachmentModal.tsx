import { useState, VFC } from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import loggerFactory from '~/utils/logger';
import { useCurrentPageAttachment } from '~/stores/page';

import { Attachment } from '~/interfaces/page';

import UserPicture from '../../client/js/components/User/UserPicture';
import { Username } from '~/components/User/Username';
import { apiPost } from '~/client/js/util/apiv1-client';

const logger = loggerFactory('growi:components:PageAccessory:PageAttachment');

type Props = {
  isOpen: boolean,
  onClose: () => void,
  attachmentToDelete: Attachment,
  activePage: number,
};

export const DeleteAttachmentModal:VFC<Props> = (props: Props) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string>();

  const { attachmentToDelete } = props;
  const { mutate: mutateCurrentPageAttachment } = useCurrentPageAttachment(props.activePage);


  const handleDeleteButton = async() => {
    setDeleteErrorMessage('');

    setIsDeleting(true);
    try {
      // TODO implement apiV3
      await apiPost('/attachments.remove', { attachment_id: attachmentToDelete._id });
      mutateCurrentPageAttachment();
      props.onClose();
    }
    catch (error) {
      logger.error(error);
      setDeleteErrorMessage(error.message);
    }
    setIsDeleting(false);
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
