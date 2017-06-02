import React from 'react';
import PropTypes from 'prop-types';

import moment from 'moment/src/moment';

import UserPicture from '../User/UserPicture';

export default class Comment extends React.Component {

  constructor(props) {
    super(props);

    this.isCurrentUserIsAuthor = this.isCurrentUserIsAuthor.bind(this);
    this.isCurrentRevision = this.isCurrentRevision.bind(this);
    this.getRootClassName = this.getRootClassName.bind(this);
  }

  isCurrentUserIsAuthor() {
    return this.props.comment.creator._id === this.props.currentUserId;
  }

  isCurrentRevision() {
    return this.props.comment.revision === this.props.currentRevisionId;
  }

  getRootClassName() {
    return "page-comment "
        + (this.isCurrentUserIsAuthor() ? 'page-comment-me' : '')
        + (this.isCurrentRevision() ? '': 'page-comment-old');
  }

  getRevisionLabelClassName() {
    return 'page-comment-revision label '
        + (this.isCurrentRevision() ? 'label-primary' : 'label-default');
  }

  render() {
    const comment = this.props.comment;
    const creator = comment.creator;

    const rootClassName = this.getRootClassName();
    const commentDate = moment(comment.createdAt).format('YYYY/MM/DD HH:mm:ss');
    const revHref = `?revision=${comment.revision}`;
    const revFirst8Letters = comment.revision.substr(0,8);
    const revisionLavelClassName = this.getRevisionLabelClassName();

    return (
      <div className={rootClassName}>
        <UserPicture user={creator} />
        <div className="page-comment-main">
          <div className="page-comment-creator">{creator.username}</div>
          <div className="page-comment-body">{comment.comment.replace(/(\r\n|\r|\n)/g, '<br>')}</div>
          <div className="page-comment-meta">
            {commentDate}&nbsp;
            <a className={revisionLavelClassName} href={revHref}>{revFirst8Letters}</a>
          </div>
        </div>
      </div>
    );
  }
}

Comment.propTypes = {
  comment: PropTypes.object.isRequired,
  currentRevisionId: PropTypes.string.isRequired,
  currentUserId: PropTypes.string.isRequired,
};
