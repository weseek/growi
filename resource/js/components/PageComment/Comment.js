import React from 'react';
import PropTypes from 'prop-types';

import moment from 'moment/src/moment';

import UserPicture from '../User/UserPicture';

export default class Comment extends React.Component {

  constructor(props) {
    super(props);

    this.getRootClassName = this.getRootClassName.bind(this);
  }

  getRootClassName() {
    let className = "page-comment"

    if (this.props.comment.creator._id === this.props.currentUserId) {
      className += ' page-comment-me'
    }

    return className;
  }

  render() {
    const comment = this.props.comment;
    const creator = comment.creator;

    const rootClassName = this.getRootClassName();
    const commentDate = moment(comment.createdAt).format('YYYY/MM/DD HH:mm:ss');
    const revHref = `?revision=${comment.revision}`;
    const revFirst8Letters = comment.revision.substr(0,8);

    return (
      <div className={rootClassName}>
        <UserPicture user={creator} />
        <div className="page-comment-main">
          <div className="page-comment-creator">{creator.username}</div>
          <div className="page-comment-body">{comment.comment.replace(/(\r\n|\r|\n)/g, '<br>')}</div>
          <div className="page-comment-meta">
            {commentDate}&nbsp;
            <a className="page-comment-revision label label-primary" href={revHref}>{revFirst8Letters}</a>
          </div>
        </div>
      </div>
    );
  }
}

Comment.propTypes = {
  comment: PropTypes.object.isRequired,
  currentUserId: PropTypes.string.isRequired,
};
