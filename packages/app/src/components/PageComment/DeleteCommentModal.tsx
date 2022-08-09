import React from 'react';

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
  comment: ICommentHasId,
  errorMessage: string,
  cancel: () => void, // for cancel evnet handling
  confirmedToDelete: () => void, // for confirmed event handling
}

export const DeleteCommentModal = (props: DeleteCommentModalProps): JSX.Element => {

  const {
    isShown, comment, errorMessage, cancel, confirmedToDelete,
  } = props;

  /*
   * the threshold for omitting body
   */
  const OMIT_BODY_THRES = 400;

  const commentDate = format(new Date(comment.createdAt), 'yyyy/MM/dd HH:mm');

  // generate body
  let commentBody = comment.comment;
  if (commentBody.length > OMIT_BODY_THRES) { // omit
    commentBody = `${commentBody.substr(0, OMIT_BODY_THRES)}...`;
  }
  const commentBodyElement = <span style={{ whiteSpace: 'pre-wrap' }}>{commentBody}</span>;

  return (
    <Modal isOpen={isShown} toggle={cancel} className={`${styles['page-comment-delete-modal']}`}>
      <ModalHeader tag="h4" toggle={cancel} className="bg-danger text-light">
        <span>
          <i className="icon-fw icon-fire"></i>
          Delete comment?
        </span>
      </ModalHeader>
      <ModalBody>
        <UserPicture user={comment.creator} size="xs" /> <strong><Username user={comment.creator}></Username></strong> wrote on {commentDate}:
        <p className="card well comment-body mt-2 p-2">{commentBodyElement}</p>
      </ModalBody>
      <ModalFooter>
        <span className="text-danger">{errorMessage}</span>&nbsp;
        <Button onClick={cancel}>Cancel</Button>
        <Button color="danger" onClick={confirmedToDelete}>
          <i className="icon icon-fire"></i>
          Delete
        </Button>
      </ModalFooter>
    </Modal>
  );

};
