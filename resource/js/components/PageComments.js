import React from 'react';
import PropTypes from 'prop-types';

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
      currentComments: [],
      newerComments: [],
      olderComments: [],

      // for deleting comment
      commentToDelete: undefined,
      isDeleteConfirmModalShown: false,
    };

    this.init = this.init.bind(this);
    this.confirmToDeleteComment = this.confirmToDeleteComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
    this.showDeleteConfirmModal = this.showDeleteConfirmModal.bind(this);
    this.closeDeleteConfirmModal = this.closeDeleteConfirmModal.bind(this);
  }

  componentWillMount() {
    const pageId = this.props.pageId;

    if (pageId) {
      this.init();
    }
  }

  init() {
    if (!this.props.pageId) {
      return ;
    }

    const pageId = this.props.pageId;
    const revisionId = this.props.revisionId;
    const revisionCreatedAt = this.props.revisionCreatedAt;

    this.props.crowi.apiGet('/comments.get', {page_id: pageId})
    .then(res => {
      if (res.ok) {
        let currentComments = [];
        let newerComments = [];
        let olderComments = [];

        // divide by revisionId and createdAt
        res.comments.forEach((comment) => {
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
        this.setState({currentComments, newerComments, olderComments});
      }
    }).catch(err => {

    });

  }

  confirmToDeleteComment(comment) {
    this.setState({commentToDelete: comment});
    this.showDeleteConfirmModal();
  }

  deleteComment() {
    const comment = this.state.commentToDelete;

    // TODO delete
    console.log(comment);

    this.closeDeleteConfirmModal();
  }

  showDeleteConfirmModal() {
    this.setState({isDeleteConfirmModalShown: true});
  }

  closeDeleteConfirmModal() {
    this.setState({
      commentToDelete: undefined,
      isDeleteConfirmModalShown: false,
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
          deleteBtnClicked={this.confirmToDeleteComment} />
      );
    });
  }

  render() {
    let currentElements = this.generateCommentElements(this.state.currentComments);
    let newerElements = this.generateCommentElements(this.state.newerComments);
    let olderElements = this.generateCommentElements(this.state.olderComments);

    let toggleNewer = (newerElements.length === 0)
      ? <div></div>
      : (
        <a className="page-comments-list-toggle-newer text-center" data-toggle="collapse" href="#page-comments-list-newer">
          <i className="fa fa-angle-double-up"></i> Comments for Newer Revision <i className="fa fa-angle-double-up"></i>
        </a>
      )
    let toggleOlder = (olderElements.length === 0)
      ? <div></div>
      : (
        <a className="page-comments-list-toggle-older text-center" data-toggle="collapse" href="#page-comments-list-older">
          <i className="fa fa-angle-double-down"></i> Comments for Older Revision <i className="fa fa-angle-double-down"></i>
        </a>
      )

    return (
      <div>
        <div className="page-comments-list-newer collapse" id="page-comments-list-newer">
          {newerElements}
        </div>
        {toggleNewer}
        <div className="page-comments-list-current" id="page-comments-list-current">
          {currentElements}
        </div>
        {toggleOlder}
        <div className="page-comments-list-older collapse in" id="page-comments-list-older">
          {olderElements}
        </div>

        <DeleteCommentModal
          isShown={this.state.isDeleteConfirmModalShown}
          comment={this.state.commentToDelete}
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
};
