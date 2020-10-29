import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';

import AppContainer from '../services/AppContainer';
import CommentContainer from '../services/CommentContainer';
import PageContainer from '../services/PageContainer';

import { withUnstatedContainers } from './UnstatedUtils';

import CommentEditor from './PageComment/CommentEditor';
import Comment from './PageComment/Comment';
import DeleteCommentModal from './PageComment/DeleteCommentModal';
import ReplayComments from './PageComment/ReplayComments';


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
      // for deleting comment
      commentToDelete: undefined,
      isDeleteConfirmModalShown: false,
      errorMessageForDeleting: undefined,

      showEditorIds: new Set(),
    };

    this.growiRenderer = this.props.appContainer.getRenderer('comment');

    this.init = this.init.bind(this);
    this.confirmToDeleteComment = this.confirmToDeleteComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
    this.showDeleteConfirmModal = this.showDeleteConfirmModal.bind(this);
    this.closeDeleteConfirmModal = this.closeDeleteConfirmModal.bind(this);
    this.replyButtonClickedHandler = this.replyButtonClickedHandler.bind(this);
    this.editorCancelHandler = this.editorCancelHandler.bind(this);
    this.editorCommentHandler = this.editorCommentHandler.bind(this);
    this.resetEditor = this.resetEditor.bind(this);
  }

  componentWillMount() {
    this.init();
  }

  init() {
    if (!this.props.pageContainer.state.pageId) {
      return;
    }

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
    const ids = this.state.showEditorIds.add(commentId);
    this.setState({ showEditorIds: ids });
  }

  editorCancelHandler(commentId) {
    this.resetEditor(commentId);
  }

  editorCommentHandler(commentId) {
    this.resetEditor(commentId);
  }

  resetEditor(commentId) {
    this.setState((prevState) => {
      prevState.showEditorIds.delete(commentId);
      return {
        showEditorIds: prevState.showEditorIds,
      };
    });
  }

  // get replies to specific comment object
  getRepliesFor(comment, allReplies) {
    const replyList = [];
    allReplies.forEach((reply) => {
      if (reply.replyTo === comment._id) {
        replyList.push(reply);
      }
    });
    return replyList;
  }

  /**
   * render Elements of Comment Thread
   *
   * @param {any} comment Comment Model Obj
   * @param {any} replies List of Reply Comment Model Obj
   *
   * @memberOf PageComments
   */
  renderThread(comment, replies) {
    const commentId = comment._id;
    const showEditor = this.state.showEditorIds.has(commentId);
    const isLoggedIn = this.props.appContainer.currentUser != null;

    let rootClassNames = 'page-comment-thread';
    if (replies.length === 0) {
      rootClassNames += ' page-comment-thread-no-replies';
    }

    return (
      <div key={commentId} className={`mb-5 ${rootClassNames}`}>
        <Comment
          comment={comment}
          deleteBtnClicked={this.confirmToDeleteComment}
          growiRenderer={this.growiRenderer}
        />
        {replies.length !== 0 && (
        <ReplayComments
          replyList={replies}
          deleteBtnClicked={this.confirmToDeleteComment}
          growiRenderer={this.growiRenderer}
        />
        )}
        { !showEditor && isLoggedIn && (
          <div className="text-right">
            <Button
              outline
              color="secondary"
              size="sm"
              className="btn-comment-reply"
              onClick={() => { return this.replyButtonClickedHandler(commentId) }}
            >
              <i className="icon-fw icon-action-undo"></i> Reply
            </Button>
          </div>
        )}
        { showEditor && (
          <div className="page-comment-reply-form ml-4 ml-sm-5 mr-3">
            <CommentEditor
              growiRenderer={this.growiRenderer}
              replyTo={commentId}
              onCancelButtonClicked={this.editorCancelHandler}
              onCommentButtonClicked={this.editorCommentHandler}
            />
          </div>
        )}
      </div>
    );
  }

  render() {
    const topLevelComments = [];
    const allReplies = [];
    const comments = this.props.commentContainer.state.comments
      .slice().reverse(); // create shallow copy and reverse

    comments.forEach((comment) => {
      if (comment.replyTo === undefined) {
        // comment is not a reply
        topLevelComments.push(comment);
      }
      else {
        // comment is a reply
        allReplies.push(comment);
      }
    });

    return (
      <div>
        { topLevelComments.map((topLevelComment) => {
          // get related replies
          const replies = this.getRepliesFor(topLevelComment, allReplies);

          return this.renderThread(topLevelComment, replies);
        }) }

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
const PageCommentsWrapper = withUnstatedContainers(PageComments, [AppContainer, PageContainer, CommentContainer]);

PageComments.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  commentContainer: PropTypes.instanceOf(CommentContainer).isRequired,
};

export default withTranslation()(PageCommentsWrapper);
