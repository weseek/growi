import React from 'react';
import PropTypes from 'prop-types';

import Comment from './PageComment/Comment';

export default class PageComments extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      currentComments: [],
      newerComments: [],
      olderComments: [],
    };

    this.fetchPageComments = this.fetchPageComments.bind(this);
  }

  componentWillMount() {
    const pageId = this.props.pageId;

    if (pageId) {
      this.fetchPageComments();
    }
  }

  fetchPageComments() {
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
          currentRevisionId={this.props.revisionId} />
      );
    });
  }

  render() {
    // TODO impl elements
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
