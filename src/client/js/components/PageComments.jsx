/* eslint-disable react/no-multi-comp */
/* eslint-disable react/no-access-state-in-setstate */
import React from 'react';
import PropTypes from 'prop-types';

import { Subscribe } from 'unstated';

import { withTranslation } from 'react-i18next';
import GrowiRenderer from '../util/GrowiRenderer';

import CommentContainer from './PageComment/CommentContainer';
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
      isLayoutTypeGrowi: false,

      // for deleting comment
      commentToDelete: undefined,
      isDeleteConfirmModalShown: false,
      errorMessageForDeleting: undefined,

      showEditorIds: new Set(),
    };

    this.growiRenderer = new GrowiRenderer(this.props.crowi, this.props.crowiOriginRenderer, { mode: 'comment' });

    this.init = this.init.bind(this);
    this.confirmToDeleteComment = this.confirmToDeleteComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
    this.showDeleteConfirmModal = this.showDeleteConfirmModal.bind(this);
    this.closeDeleteConfirmModal = this.closeDeleteConfirmModal.bind(this);
    this.replyButtonClickedHandler = this.replyButtonClickedHandler.bind(this);
  }

  componentWillMount() {
    this.init();
  }

  init() {
    if (!this.props.pageId) {
      return;
    }

    const layoutType = this.props.crowi.getConfig().layoutType;
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

  // inserts reply after each corresponding comment
  reorderBasedOnReplies(comments, replies) {
    // const connections = this.findConnections(comments, replies);
    // const replyConnections = this.findConnectionsWithinReplies(replies);
    const repliesReversed = replies.slice().reverse();
    for (let i = 0; i < comments.length; i++) {
      for (let j = 0; j < repliesReversed.length; j++) {
        if (repliesReversed[j].replyTo === comments[i]._id) {
          comments.splice(i + 1, 0, repliesReversed[j]);
        }
      }
    }
    return comments;
  }

  /**
   * generate Elements of Comment
   *
   * @param {any} comments Array of Comment Model Obj
   *
   * @memberOf PageComments
   */
  generateCommentElements(comments, replies) {
    const commentsWithReplies = this.reorderBasedOnReplies(comments, replies);
    return commentsWithReplies.map((comment) => {

      const commentId = comment._id;
      const showEditor = this.state.showEditorIds.has(commentId);

      return (
        <div key={commentId}>
          <Comment
            comment={comment}
            deleteBtnClicked={this.confirmToDeleteComment}
            crowiRenderer={this.growiRenderer}
            onReplyButtonClicked={() => { this.replyButtonClickedHandler(commentId) }}
            crowi={this.props.crowi}
          />
          { showEditor && (
            <CommentEditor
              crowi={this.props.crowi}
              crowiOriginRenderer={this.props.crowiOriginRenderer}
              editorOptions={this.props.editorOptions}
            />
          )}
        </div>
      );
    });
  }

  render() {
    const currentComments = [];
    const newerComments = [];
    const olderComments = [];
    const currentReplies = [];
    const newerReplies = [];
    const olderReplies = [];

    let comments = this.props.commentContainer.state.comments;
    if (this.state.isLayoutTypeGrowi) {
      // replace with asc order array
      comments = comments.slice().reverse(); // non-destructive reverse
    }

    // divide by revisionId and createdAt
    const revisionId = this.props.revisionId;
    const revisionCreatedAt = this.props.revisionCreatedAt;
    comments.forEach((comment) => {
      // comparing ObjectId
      // eslint-disable-next-line eqeqeq
      if (comment.replyTo === undefined) {
        // comment is not a reply
        if (comment.revision === revisionId) {
          currentComments.push(comment);
        }
        else if (Date.parse(comment.createdAt) / 1000 > revisionCreatedAt) {
          newerComments.push(comment);
        }
        else {
          olderComments.push(comment);
        }
      }
      else
      // comment is a reply
      if (comment.revision === revisionId) {
        currentReplies.push(comment);
      }
      else if (Date.parse(comment.createdAt) / 1000 > revisionCreatedAt) {
        newerReplies.push(comment);
      }
      else {
        olderReplies.push(comment);
      }
    });

    // generate elements
    const currentElements = this.generateCommentElements(currentComments, currentReplies);
    const newerElements = this.generateCommentElements(newerComments, newerReplies);
    const olderElements = this.generateCommentElements(olderComments, olderReplies);
    // generate blocks
    const currentBlock = (
      <div className="page-comments-list-current" id="page-comments-list-current">
        {currentElements}
      </div>
    );
    const newerBlock = (
      <div className="page-comments-list-newer collapse in" id="page-comments-list-newer">
        {newerElements}
      </div>
    );
    const olderBlock = (
      <div className="page-comments-list-older collapse in" id="page-comments-list-older">
        {olderElements}
      </div>
    );

    // generate toggle elements
    const iconForNewer = (this.state.isLayoutTypeGrowi)
      ? <i className="fa fa-angle-double-down"></i>
      : <i className="fa fa-angle-double-up"></i>;
    const toggleNewer = (newerElements.length === 0)
      ? <div></div>
      : (
        <a className="page-comments-list-toggle-newer text-center" data-toggle="collapse" href="#page-comments-list-newer">
          {iconForNewer} Comments for Newer Revision {iconForNewer}
        </a>
      );
    const iconForOlder = (this.state.isLayoutTypeGrowi)
      ? <i className="fa fa-angle-double-up"></i>
      : <i className="fa fa-angle-double-down"></i>;
    const toggleOlder = (olderElements.length === 0)
      ? <div></div>
      : (
        <a className="page-comments-list-toggle-older text-center" data-toggle="collapse" href="#page-comments-list-older">
          {iconForOlder} Comments for Older Revision {iconForOlder}
        </a>
      );

    // layout blocks
    const commentsElements = (this.state.isLayoutTypeGrowi)
      ? (
        <div>
          {olderBlock}
          {toggleOlder}
          {currentBlock}
          {toggleNewer}
          {newerBlock}
        </div>
      )
      : (
        <div>
          {newerBlock}
          {toggleNewer}
          {currentBlock}
          {toggleOlder}
          {olderBlock}
        </div>
      );

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
      <Subscribe to={[CommentContainer]}>
        { commentContainer => (
          // eslint-disable-next-line arrow-body-style
          <PageComments commentContainer={commentContainer} {...this.props} />
        )}
      </Subscribe>
    );
  }

}

PageCommentsWrapper.propTypes = {
  crowi: PropTypes.object.isRequired,
  crowiOriginRenderer: PropTypes.object.isRequired,
  pageId: PropTypes.string.isRequired,
  revisionId: PropTypes.string.isRequired,
  revisionCreatedAt: PropTypes.number,
  pagePath: PropTypes.string,
  editorOptions: PropTypes.object,
  slackChannels: PropTypes.string,
};
PageComments.propTypes = {
  commentContainer: PropTypes.object.isRequired,

  crowi: PropTypes.object.isRequired,
  crowiOriginRenderer: PropTypes.object.isRequired,
  pageId: PropTypes.string.isRequired,
  revisionId: PropTypes.string.isRequired,
  revisionCreatedAt: PropTypes.number,
  pagePath: PropTypes.string,
  editorOptions: PropTypes.object,
  slackChannels: PropTypes.string,
};

export default withTranslation(null, { withRef: true })(PageCommentsWrapper);
