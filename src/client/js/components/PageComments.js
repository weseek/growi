import React from 'react';
import PropTypes from 'prop-types';

import GrowiRenderer from '../util/GrowiRenderer';

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
export default class PageComments extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      // desc order array
      comments: [],

      isLayoutTypeGrowi: false,

      // for deleting comment
      commentToDelete: undefined,
      isDeleteConfirmModalShown: false,
      errorMessageForDeleting: undefined,
    };

    this.growiRenderer = new GrowiRenderer(this.props.crowi, this.props.crowiOriginRenderer, {mode: 'comment'});

    this.init = this.init.bind(this);
    this.confirmToDeleteComment = this.confirmToDeleteComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
    this.showDeleteConfirmModal = this.showDeleteConfirmModal.bind(this);
    this.closeDeleteConfirmModal = this.closeDeleteConfirmModal.bind(this);
  }

  componentWillMount() {
    this.init();
    this.retrieveData = this.retrieveData.bind(this);
  }

  init() {
    if (!this.props.pageId) {
      return;
    }

    const layoutType = this.props.crowi.getConfig()['layoutType'];
    this.setState({isLayoutTypeGrowi: 'crowi-plus' === layoutType || 'growi' === layoutType});

    this.retrieveData();
  }

  /**
   * Load data of comments and store them in state
   */
  retrieveData() {
    // get data (desc order array)
    this.props.crowi.apiGet('/comments.get', {page_id: this.props.pageId})
      .then(res => {
        if (res.ok) {
          this.setState({comments: res.comments});
        }
      });
  }

  confirmToDeleteComment(comment) {
    this.setState({commentToDelete: comment});
    this.showDeleteConfirmModal();
  }

  deleteComment() {
    const comment = this.state.commentToDelete;

    this.props.crowi.apiPost('/comments.remove', {comment_id: comment._id})
    .then(res => {
      if (res.ok) {
        this.findAndSplice(comment);
      }
      this.closeDeleteConfirmModal();
    }).catch(err => {
      this.setState({errorMessageForDeleting: err.message});
    });
  }

  findAndSplice(comment) {
    let comments = this.state.comments;

    const index = comments.indexOf(comment);
    if (index < 0) {
      return;
    }
    comments.splice(index, 1);

    this.setState({comments});
  }

  showDeleteConfirmModal() {
    this.setState({isDeleteConfirmModalShown: true});
  }

  closeDeleteConfirmModal() {
    this.setState({
      commentToDelete: undefined,
      isDeleteConfirmModalShown: false,
      errorMessageForDeleting: undefined,
    });
  }

  /**
   * generate Elements of Comment
   *
   * @param {any} comments Array of Comment Model Obj
   *
   * @memberOf PageComments
   */
  generateCommentElements(comments) {
    return comments.map((comment) => {
      return (
        <Comment key={comment._id} comment={comment}
          currentUserId={this.props.crowi.me}
          currentRevisionId={this.props.revisionId}
          deleteBtnClicked={this.confirmToDeleteComment}
          crowi={this.props.crowi}
          crowiRenderer={this.growiRenderer} />
      );
    });
  }

  render() {
    let currentComments = [];
    let newerComments = [];
    let olderComments = [];

    let comments = this.state.comments;
    if (this.state.isLayoutTypeGrowi) {
      // replace with asc order array
      comments = comments.slice().reverse();  // non-destructive reverse
    }

    // divide by revisionId and createdAt
    const revisionId = this.props.revisionId;
    const revisionCreatedAt = this.props.revisionCreatedAt;
    comments.forEach((comment) => {
      if (comment.revision == revisionId) {
        currentComments.push(comment);
      }
      else if (Date.parse(comment.createdAt)/1000 > revisionCreatedAt) {
        newerComments.push(comment);
      }
      else {
        olderComments.push(comment);
      }
    });

    // generate elements
    const currentElements = this.generateCommentElements(currentComments);
    const newerElements = this.generateCommentElements(newerComments);
    const olderElements = this.generateCommentElements(olderComments);
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

PageComments.propTypes = {
  pageId: PropTypes.string,
  revisionId: PropTypes.string,
  revisionCreatedAt: PropTypes.number,
  crowi: PropTypes.object.isRequired,
  crowiOriginRenderer: PropTypes.object.isRequired,
};
