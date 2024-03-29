import React from 'react';

import { isPopulated } from '@growi/core';
import { UserPicture } from '@growi/ui/dist/components';
import { format } from 'date-fns';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { ICommentHasId } from '../../interfaces/comment';
import { Username } from '../User/Username';

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

  const headerContent = () => {
    if (comment == null || isShown === false) {
      return <></>;
    }
    return (
      <span>
        <span className="material-symbols-outlined">delete_forever</span>
        Delete comment?
      </span>
    );
  };

  const bodyContent = () => {
    if (comment == null || isShown === false) {
      return <></>;
    }

    // the threshold for omitting body
    const OMIT_BODY_THRES = 400;

    const commentDate = format(new Date(comment.createdAt), 'yyyy/MM/dd HH:mm');

    const creator = isPopulated(comment.creator) ? comment.creator : undefined;

    let commentBody = comment.comment;
    if (commentBody.length > OMIT_BODY_THRES) { // omit
      commentBody = `${commentBody.substr(0, OMIT_BODY_THRES)}...`;
    }
    const commentBodyElement = <span style={{ whiteSpace: 'pre-wrap' }}>{commentBody}</span>;

    return (
      <>
        <UserPicture user={creator} size="xs" /> <strong><Username user={creator}></Username></strong> wrote on {commentDate}:
        <p className="card custom-card comment-body mt-2 p-2">{commentBodyElement}</p>
      </>
    );
  };

  const footerContent = () => {
    if (comment == null || isShown === false) {
      return <></>;
    }
    return (
      <>
        <span className="text-danger">{errorMessage}</span>&nbsp;
        <Button onClick={cancelToDelete}>Cancel</Button>
        <Button color="danger" onClick={confirmToDelete}>
          <span className="material-symbols-outlined">delete_forever</span>
          Delete
        </Button>
      </>
    );
  };

  return (
    <Modal isOpen={isShown} toggle={cancelToDelete} className={`${styles['page-comment-delete-modal']}`}>
      <ModalHeader tag="h4" toggle={cancelToDelete} className="bg-danger text-light">
        {headerContent()}
      </ModalHeader>
      <ModalBody>
        {bodyContent()}
      </ModalBody>
      <ModalFooter>
        {footerContent()}
      </ModalFooter>
    </Modal>
  );
};
