import React from 'react';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap/es/Button';

import { withTranslation } from 'react-i18next';

import AppContainer from '../services/AppContainer';
import CommentContainer from '../services/CommentContainer';
import PageContainer from '../services/PageContainer';

import { createSubscribedElement } from './UnstatedUtils';

import CommentEditor from './PageComment/CommentEditor';
import Comment from './PageComment/Comment';
import DeleteCommentModal from './PageComment/DeleteCommentModal';


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
    this.commentButtonClickedHandler = this.commentButtonClickedHandler.bind(this);
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

  confirmToEditComment(comment) {
    console.log("Pushed Edit button");
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

  commentButtonClickedHandler(commentId) {
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
    const isLoggedIn = this.props.appContainer.me != null;

    let rootClassNames = 'page-comment-thread';
    if (replies.length === 0) {
      rootClassNames += ' page-comment-thread-no-replies';
    }

    return (
      <div key={commentId} className={`mb-5 ${rootClassNames}`}>
        <Comment
          comment={comment}
          editBtnClicked={this.confirmToEditComment}
          deleteBtnClicked={this.confirmToDeleteComment}
          growiRenderer={this.growiRenderer}
          replyList={replies}
        />
        { !showEditor && isLoggedIn && (
          <div className="text-right">
            <Button
              bsStyle="default"
              className="btn btn-outline btn-default btn-sm btn-comment-reply"
              onClick={() => { return this.replyButtonClickedHandler(commentId) }}
            >
              <i className="icon-fw icon-action-redo"></i> Reply
            </Button>
          </div>
        )}
        { showEditor && isLoggedIn && (
          <div className="page-comment-reply-form">
            <CommentEditor
              growiRenderer={this.growiRenderer}
              replyTo={commentId}
              commentButtonClickedHandler={this.commentButtonClickedHandler}
            />
          </div>
        )}
      </div>
    );
  }

  render() {
    const topLevelComments = [];
    const allReplies = [];

    const layoutType = this.props.appContainer.getConfig().layoutType;
    const isBaloonStyle = layoutType.match(/crowi-plus|growi|kibela/);

    let comments = this.props.commentContainer.state.comments;
    if (isBaloonStyle) {
      // replace with asc order array
      comments = comments.slice().reverse(); // non-destructive reverse
    }

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
const PageCommentsWrapper = (props) => {
  return createSubscribedElement(PageComments, props, [AppContainer, PageContainer, CommentContainer]);
};

PageComments.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  commentContainer: PropTypes.instanceOf(CommentContainer).isRequired,
};

export default withTranslation()(PageCommentsWrapper);
