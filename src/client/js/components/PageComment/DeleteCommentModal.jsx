import React from 'react';
import PropTypes from 'prop-types';

import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { format } from 'date-fns';

import UserPicture from '../User/UserPicture';
import Username from '../User/Username';

export default class DeleteCommentModal extends React.Component {

  /*
   * the threshold for omitting body
   */
  static get OMIT_BODY_THRES() { return 400 }

  componentWillMount() {
  }

  render() {
    if (this.props.comment === undefined) {
      return <div></div>;
    }

    const comment = this.props.comment;
    const commentDate = format(new Date(comment.createdAt), 'yyyy/MM/dd HH:mm');

    // generate body
    let commentBody = comment.comment;
    if (commentBody.length > DeleteCommentModal.OMIT_BODY_THRES) { // omit
      commentBody = `${commentBody.substr(0, DeleteCommentModal.OMIT_BODY_THRES)}...`;
    }
    commentBody = <span style={{ whiteSpace: 'pre-wrap' }}>{commentBody}</span>;

    return (
      <Modal isOpen={this.props.isShown} toggle={this.props.cancel} className="page-comment-delete-modal">
        <ModalHeader toggle={this.props.cancel}>
          <span>
            <i className="icon-fw icon-fire text-danger"></i>
            Delete comment?
          </span>
        </ModalHeader>
        <ModalBody>
          <UserPicture user={comment.creator} size="xs" /> <strong><Username user={comment.creator}></Username></strong> wrote on {commentDate}:
          <p className="well well-sm comment-body mt-2">{commentBody}</p>
        </ModalBody>
        <ModalFooter>
          <span className="text-danger">{this.props.errorMessage}</span>&nbsp;
          <Button onClick={this.props.cancel} bsClass="btn btn-sm">Cancel</Button>
          <Button onClick={this.props.confirmedToDelete} bsClass="btn btn-sm btn-danger">
            <i className="icon icon-fire"></i>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

}

DeleteCommentModal.propTypes = {
  isShown: PropTypes.bool.isRequired,
  comment: PropTypes.object,
  errorMessage: PropTypes.string,
  cancel: PropTypes.func.isRequired, // for cancel evnet handling
  confirmedToDelete: PropTypes.func.isRequired, // for confirmed event handling
};
