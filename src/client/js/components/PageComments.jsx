import React from 'react';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap/es/Button';

import { withTranslation } from 'react-i18next';

import AppContainer from '../services/AppContainer';
import CommentContainer from '../services/CommentContainer';

import { createSubscribedElement } from './UnstatedUtils';
import CommentEditor from './PageComment/CommentEditor';

import Comment from './PageComment/Comment';
import DeleteCommentModal from './PageComment/DeleteCommentModal';
import PageContainer from '../services/PageContainer';


/**
 * Load data of comments and render the list of <Comment />
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 * @export
 * @class PageComments
 * @extends {React.Component}
 */
class PageComments extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isLayoutTypeGrowi: false,

      // for deleting comment
      commentToDelete: undefined,
      isDeleteConfirmModalShown: false,
      errorMessageForDeleting: undefined,

      showEditorIdsForReply: new Set(),
      showEditorIdsForReEdit: new Set(),
    };

    this.growiRenderer = this.props.appContainer.getRenderer('comment');

    this.init = this.init.bind(this);
    this.confirmToDeleteComment = this.confirmToDeleteComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
    this.showDeleteConfirmModal = this.showDeleteConfirmModal.bind(this);
    this.closeDeleteConfirmModal = this.closeDeleteConfirmModal.bind(this);
    this.replyButtonClickedHandler = this.replyButtonClickedHandler.bind(this);
    this.reEditButtonClickedHandler = this.reEditButtonClickedHandler.bind(this);
    this.commentButtonClickedHandler = this.commentButtonClickedHandler.bind(this);
  }

  componentWillMount() {
    this.init();
  }

  init() {
    if (!this.props.pageContainer.state.pageId) {
      return;
    }

    const layoutType = this.props.appContainer.getConfig().layoutType;
    this.setState({ isLayoutTypeGrowi: layoutType === 'crowi-plus' || layoutType === 'growi' });

    this.props.commentContainer.retrieveComments();
  }

  confirmToDeleteComment(comment) {
    this.setState({ commentToDelete: comment });
    this.showDeleteConfirmModal();
  }

  deleteComment() {
    const comment = this.state.commentToDelete;

    this.props.commentContainer.deleteComment(comment)
      .then(() => {
        this.closeDeleteConfirmModal();
      })
      .catch((err) => {
        this.setState({ errorMessageForDeleting: err.message });
      });
  }

  showDeleteConfirmModal() {
    this.setState({ isDeleteConfirmModalShown: true });
  }

  closeDeleteConfirmModal() {
    this.setState({
      commentToDelete: undefined,
      isDeleteConfirmModalShown: false,
      errorMessageForDeleting: undefined,
    });
  }

  replyButtonClickedHandler(commentId) {
    const ids = this.state.showEditorIdsForReply.add(commentId);
    this.setState({ showEditorIdsForReply: ids });
  }

  reEditButtonClickedHandler(commentId) {
    const ids = this.state.showEditorIdsForReEdit.add(commentId);
    this.setState({ showEditorIdsForReEdit: ids });
  }

  commentButtonClickedHandler(commentId) {
    this.setState((prevState) => {
      prevState.showEditorIdsForReply.delete(commentId);
      prevState.showEditorIdsForReEdit.delete(commentId);
      return {
        showEditorIdsForReply: prevState.showEditorIdsForReply,
      };
    });
  }

  // adds replies to specific comment object
  addRepliesToComments(comment, replies) {
    const replyList = [];
    replies.forEach((reply) => {
      if (reply.replyTo === comment._id) {
        replyList.push(reply);
      }
    });
    return replyList;
  }

  /**
   * generate Elements of Comment
   *
   * @param {any} comments Array of Comment Model Obj
   *
   * @memberOf PageComments
   */
  generateCommentElements(comments, replies) {
    return comments.map((comment) => {

      const commentId = comment._id;
      const commentBody = comment.comment;
      const showEditorForReply = this.state.showEditorIdsForReply.has(commentId);
      const showEditorForReEdit = this.state.showEditorIdsForReEdit.has(commentId);
      const username = this.props.appContainer.me;

      const replyList = this.addRepliesToComments(comment, replies);

      return (
        <div key={commentId}>
          { !showEditorForReEdit && (
            <Comment
              comment={comment}
              deleteBtnClicked={this.confirmToDeleteComment}
              editBtnClicked={this.reEditButtonClickedHandler}
              growiRenderer={this.growiRenderer}
              replyList={replyList}
            />
          )}
          {
            showEditorForReEdit && (
              <CommentEditor
                commentBody={commentBody}
                growiRenderer={this.growiRenderer}
                replyTo={commentId}
                commentButtonClickedHandler={this.commentButtonClickedHandler}
              />
            )
          }

          <div className="container-fluid">
            <div className="row">
              <div className="col-xs-offset-1 col-xs-11 col-sm-offset-1 col-sm-11 col-md-offset-1 col-md-11 col-lg-offset-1 col-lg-11">
                { !showEditorForReply && (
                  <div>
                    { username
                    && (
                      <div className="col-xs-offset-6 col-sm-offset-6 col-md-offset-6 col-lg-offset-6">
                        <Button
                          bsStyle="primary"
                          className="fcbtn btn btn-outline btn-rounded btn-xxs"
                          onClick={() => { return this.replyButtonClickedHandler(commentId) }}
                        >
                          Reply <i className="fa fa-mail-reply"></i>
                        </Button>
                      </div>
                    )
                  }
                  </div>
                )}
                { showEditorForReply && (
                  <CommentEditor
                    growiRenderer={this.growiRenderer}
                    replyTo={commentId}
                    commentButtonClickedHandler={this.commentButtonClickedHandler}
                  />
                )}
              </div>
            </div>
          </div>
          <br />
        </div>
      );
    });
  }

  render() {
    const currentComments = [];
    const currentReplies = [];

    let comments = this.props.commentContainer.state.comments;
    if (this.state.isLayoutTypeGrowi) {
      // replace with asc order array
      comments = comments.slice().reverse(); // non-destructive reverse
    }

    comments.forEach((comment) => {
      if (comment.replyTo === undefined) {
      // comment is not a reply
        currentComments.push(comment);
      }
      else {
      // comment is a reply
        currentReplies.push(comment);
      }
    });

    // generate elements
    const currentElements = this.generateCommentElements(currentComments, currentReplies);

    // generate blocks
    const currentBlock = (
      <div className="page-comments-list-current" id="page-comments-list-current">
        {currentElements}
      </div>
    );

    // layout blocks
    const commentsElements = (<div>{currentBlock}</div>);

    return (
      <div>
        {commentsElements}

        <DeleteCommentModal
          isShown={this.state.isDeleteConfirmModalShown}
          comment={this.state.commentToDelete}
          errorMessage={this.state.errorMessageForDeleting}
          cancel={this.closeDeleteConfirmModal}
          confirmedToDelete={this.deleteComment}
        />
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const PageCommentsWrapper = (props) => {
  return createSubscribedElement(PageComments, props, [AppContainer, PageContainer, CommentContainer]);
};

PageComments.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  commentContainer: PropTypes.instanceOf(CommentContainer).isRequired,
};

export default withTranslation()(PageCommentsWrapper);
