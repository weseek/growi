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

    const iconName = this.props.revisionDiffOpened ? 'caret-down' : 'caret-right';
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
            <a className="diff-view" onClick={this._onDiffOpenClicked}>
              <Icon name={iconName} /> View diff
            </a>
            <a href={"?revision=" + revision._id }>
              <Icon name="sign-in" /> Go to this version
            </a>
          </p>
        </div>
      </div>
    );
  }
}

Revision.propTypes = {
  revision: PropTypes.object,
  revisionDiffOpened: PropTypes.bool.isRequired,
  onDiffOpenClicked: PropTypes.func.isRequired,
}

