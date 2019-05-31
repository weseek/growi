/* eslint-disable react/no-multi-comp */
/* eslint-disable react/no-access-state-in-setstate */
import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/es/Button';

import { Subscribe } from 'unstated';

import { withTranslation } from 'react-i18next';
import GrowiRenderer from '../util/GrowiRenderer';

import AppContainer from '../services/AppContainer';
import CommentContainer from '../services/CommentContainer';

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

      showEditorIds: new Set(),
    };

    this.growiRenderer = new GrowiRenderer(window.crowi, this.props.crowiOriginRenderer, { mode: 'comment' });

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
      const showEditor = this.state.showEditorIds.has(commentId);
      const username = this.props.appContainer.me;

      const replyList = this.addRepliesToComments(comment, replies);

      return (
        <div key={commentId}>
          <Comment
            comment={comment}
            deleteBtnClicked={this.confirmToDeleteComment}
            crowiRenderer={this.growiRenderer}
            replyList={replyList}
            revisionCreatedAt={this.props.revisionCreatedAt}
          />
          <div className="container-fluid">
            <div className="row">
              <div className="col-xs-offset-1 col-xs-11 col-sm-offset-1 col-sm-11 col-md-offset-1 col-md-11 col-lg-offset-1 col-lg-11">
                { !showEditor && (
                  <div>
                    { username
                    && (
                      <div className="col-xs-offset-6 col-sm-offset-6 col-md-offset-6 col-lg-offset-6">
                        <Button
                          bsStyle="primary"
                          className="fcbtn btn btn-sm btn-primary btn-outline btn-rounded btn-1b"
                          onClick={() => { return this.replyButtonClickedHandler(commentId) }}
                        >
                          <i className="icon-bubble"></i> Reply
                        </Button>
                      </div>
                    )
                  }
                  </div>
                )}
                { showEditor && (
                  <CommentEditor
                    crowiOriginRenderer={this.props.crowiOriginRenderer}
                    slackChannels={this.props.slackChannels}
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
class PageCommentsWrapper extends React.Component {

  render() {
    return (
      <Subscribe to={[AppContainer, PageContainer, CommentContainer]}>
        { (appContainer, pageContainer, commentContainer) => (
          // eslint-disable-next-line arrow-body-style
          <PageComments appContainer={appContainer} pageContainer={pageContainer} commentContainer={commentContainer} {...this.props} />
        )}
      </Subscribe>
    );
  }

}

PageComments.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  commentContainer: PropTypes.instanceOf(CommentContainer).isRequired,

  crowiOriginRenderer: PropTypes.object.isRequired,
  revisionCreatedAt: PropTypes.number,
  slackChannels: PropTypes.string,
};
PageCommentsWrapper.propTypes = {
  crowiOriginRenderer: PropTypes.object.isRequired,
  revisionCreatedAt: PropTypes.number,
  slackChannels: PropTypes.string,
};

export default withTranslation(null, { withRef: true })(PageCommentsWrapper);
