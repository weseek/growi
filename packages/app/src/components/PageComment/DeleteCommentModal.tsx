import React, { useMemo } from 'react';

import { UserPicture } from '@growi/ui';
import { format } from 'date-fns';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { ICommentHasId } from '../../interfaces/comment';
import Username from '../User/Username';

import styles from './DeleteCommentModal.module.scss';


export type DeleteCommentModalProps = {
  isShown: boolean,
  comment: ICommentHasId | null,
  errorMessage: string,
  cancelToDelete: () => void,
  confirmToDelete: () => void,
}

export const DeleteCommentModal = (props: DeleteCommentModalProps): JSX.Element => {
  const {
    isShown, comment, errorMessage, cancelToDelete, confirmToDelete,
  } = props;

  const HeaderContent = React.memo(() => {
    if (comment == null || isShown === false) {
      return <></>;
    }
    return (
      <span>
        <i className="icon-fw icon-fire"></i>
        Delete comment?
      </span>
    );
  });
  HeaderContent.displayName = 'HeaderContent';

  const BodyContent = React.memo(() => {
    if (comment == null || isShown === false) {
      return <></>;
    }

    // the threshold for omitting body
    const OMIT_BODY_THRES = 400;

    const commentDate = format(new Date(comment.createdAt), 'yyyy/MM/dd HH:mm');

    let commentBody = comment.comment;
    if (commentBody.length > OMIT_BODY_THRES) { // omit
      commentBody = `${commentBody.substr(0, OMIT_BODY_THRES)}...`;
    }
    const commentBodyElement = <span style={{ whiteSpace: 'pre-wrap' }}>{commentBody}</span>;

    return (
      <>
        <UserPicture user={comment.creator} size="xs" /> <strong><Username user={comment.creator}></Username></strong> wrote on {commentDate}:
        <p className="card well comment-body mt-2 p-2">{commentBodyElement}</p>
      </>
    );
  });
  BodyContent.displayName = 'BodyContent';

  const FooterContent = React.memo(() => {
    if (comment == null || isShown === false) {
      return <></>;
    }
    return (
      <>
        <span className="text-danger">{errorMessage}</span>&nbsp;
        <Button onClick={cancelToDelete}>Cancel</Button>
        <Button color="danger" onClick={confirmToDelete}>
          <i className="icon icon-fire"></i>
          Delete
        </Button>
      </>
    );
  });
  FooterContent.displayName = 'FooterContent';

  return (
    <Modal isOpen={isShown} toggle={cancelToDelete} className={`${styles['page-comment-delete-modal']}`}>
      <ModalHeader tag="h4" toggle={cancelToDelete} className="bg-danger text-light">
        <HeaderContent/>
      </ModalHeader>
      <ModalBody>
        <BodyContent/>
      </ModalBody>
      <ModalFooter>
        <FooterContent/>
      </ModalFooter>
    </Modal>
  );
};
