import React from 'react';
import PropTypes from 'prop-types';

import UserDate     from '../Common/UserDate';
import Icon         from '../Common/Icon';
import UserPicture  from '../User/UserPicture';

export default class Revision extends React.Component {

  constructor(props) {
    super(props);

    this._onDiffOpenClicked = this._onDiffOpenClicked.bind(this);
  }

  componentDidMount() {
  }

  _onDiffOpenClicked() {
    this.props.onDiffOpenClicked(this.props.revision);
  }

  render() {
    const revision = this.props.revision;
    const author = revision.author;

    let pic = '';
    if (typeof author === 'object') {
      pic = <UserPicture user={author} />;
    }

    return (
      <div className="revision-history-main">
        {pic}
        <div className="revision-history-author">
          <strong>{author.username}</strong>
        </div>
        <div className="revision-history-meta">
          <p>
            <UserDate dateTime={revision.createdAt} />
          </p>
          <p>
            <a href={"?revision=" + revision._id }>
              <Icon name="history" /> View this version
            </a>
            <a className="diff-view" onClick={this._onDiffOpenClicked}>
              <Icon name="level-down" /> View diff
            </a>
          </p>
        </div>
      </div>
    );
  }
}

Revision.propTypes = {
  revision: PropTypes.object,
  onDiffOpenClicked: PropTypes.func.isRequired,
}

