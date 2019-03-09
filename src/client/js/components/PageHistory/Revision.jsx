import React from 'react';
import PropTypes from 'prop-types';

import UserDate from '../Common/UserDate';
import UserPicture from '../User/UserPicture';

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

  renderSimplifiedNodiff(revision) {
    const { t } = this.props;

    const author = revision.author;

    let pic = '';
    if (typeof author === 'object') {
      pic = <UserPicture user={author} size="sm" />;
    }

    return (
      <div className="revision-history-main revision-history-main-nodiff my-1 d-flex align-items-center">
        <div className="picture-container">
          {pic}
        </div>
        <div className="m-l-10">
          <div className="revision-history-meta">
            <span className="text-muted small">
              <UserDate dateTime={revision.createdAt} /> ({ t('No diff') })
            </span>
          </div>
        </div>
      </div>
    );
  }

  renderFull(revision) {
    const { t } = this.props;

    const author = revision.author;

    let pic = '';
    if (typeof author === 'object') {
      pic = <UserPicture user={author} size="lg" />;
    }

    const iconClass = this.props.revisionDiffOpened ? 'caret caret-opened' : 'caret';
    return (
      <div className="revision-history-main d-flex mt-3">
        <div className="m-t-5">
          {pic}
        </div>
        <div className="m-l-10">
          <div className="revision-history-author">
            <strong>{author.username}</strong>
          </div>
          <div className="revision-history-meta">
            <p>
              <UserDate dateTime={revision.createdAt} />
            </p>
            <p>
              <span className="d-inline-block" style={{ minWidth: '90px' }}>
                { !this.props.hasDiff
                  && <span className="text-muted">{ t('No diff') }</span>
                }
                { this.props.hasDiff
                  && (
                  <a className="diff-view" onClick={this._onDiffOpenClicked}>
                    <i className={iconClass}></i> { t('View diff') }
                  </a>
)
                }
              </span>
              <a href={`?revision=${revision._id}`} className="m-l-10">
                <i className="icon-login"></i> { t('Go to this version') }
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const revision = this.props.revision;

    if (this.props.isCompactNodiffRevisions && !this.props.hasDiff) {
      return this.renderSimplifiedNodiff(revision);
    }

    return this.renderFull(revision);

  }

}

Revision.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  revision: PropTypes.object,
  revisionDiffOpened: PropTypes.bool.isRequired,
  hasDiff: PropTypes.bool.isRequired,
  isCompactNodiffRevisions: PropTypes.bool.isRequired,
  onDiffOpenClicked: PropTypes.func.isRequired,
};
