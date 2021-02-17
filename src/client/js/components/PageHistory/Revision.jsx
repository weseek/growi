import React from 'react';
import PropTypes from 'prop-types';

import UserDate from '../User/UserDate';
import Username from '../User/Username';
import UserPicture from '../User/UserPicture';

export default class Revision extends React.Component {

  componentDidMount() {
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
        <div className="ml-3">
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

    return (
      <div className="revision-history-main d-flex mt-3">
        <div className="mt-2">
          {pic}
        </div>
        <div className="ml-2">
          <div className="revision-history-author">
            <strong><Username user={author}></Username></strong>
            {this.props.isLatestRevision && <span className="badge badge-info ml-2">Latest</span>}
          </div>
          <div className="revision-history-meta">
            <p>
              <UserDate dateTime={revision.createdAt} />
            </p>
            <p>
              <a href={`?revision=${revision._id}`}>
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
  isLatestRevision: PropTypes.bool.isRequired,
  revisionDiffOpened: PropTypes.bool.isRequired,
  hasDiff: PropTypes.bool.isRequired,
  isCompactNodiffRevisions: PropTypes.bool.isRequired,
};
