/* eslint-disable react/no-multi-comp */
/* eslint-disable react/no-access-state-in-setstate */
import React from 'react';
import PropTypes from 'prop-types';

import { Subscribe } from 'unstated';

import { withTranslation } from 'react-i18next';
import GrowiRenderer from '../util/GrowiRenderer';

import CommentContainer from './PageComment/CommentContainer';
import UserPicture from './User/UserPicture';
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
      const crowi = this.props.crowi;
      const username = crowi.me;
      const user = crowi.findUser(username);
      const isLayoutTypeGrowi = this.state.isLayoutTypeGrowi;

      const replyList = this.addRepliesToComments(comment, replies);

      return (
        <div key={commentId}>
          <Comment
            comment={comment}
            deleteBtnClicked={this.confirmToDeleteComment}
            crowiRenderer={this.growiRenderer}
            crowi={this.props.crowi}
            replyTo={undefined}
            replyList={replyList}
            revisionCreatedAt={this.props.revisionCreatedAt}
            revisionId={this.props.revisionId}
          />
          <div className="container-fluid">
            <div className="row">
              <div className="col-xs-offset-1 col-xs-11 col-sm-offset-1 col-sm-11 col-md-offset-1 col-md-11 col-lg-offset-1 col-lg-11">
                { !showEditor && (
                  <div className="form page-comment-form">
                    { username
                    && (
                      <div className="comment-form">
                        { isLayoutTypeGrowi
                        && (
                          <div className="comment-form-user">
                            <UserPicture user={user} />
                          </div>
                        )
                        }
                        <div className="comment-form-main">
                          <button
                            type="button"
                            className={`btn btn-lg ${this.state.isLayoutTypeGrowi ? 'btn-link' : 'btn-primary'} center-block`}
                            onClick={() => { return this.replyButtonClickedHandler(commentId) }}
                          >
                            <i className="icon-bubble"></i> Reply
                          </button>
                        </div>
                      </div>
                    )
                  }
                  </div>
                )}
                { showEditor && (
                  <CommentEditor
                    crowi={this.props.crowi}
                    crowiOriginRenderer={this.props.crowiOriginRenderer}
                    editorOptions={this.props.editorOptions}
                    slackChannels={this.props.slackChannels}
                    replyTo={commentId}
                  />
                )}
              </div>
            </div>
          </div>
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
