import React from 'react';
import PropTypes from 'prop-types';

import UserDate from '../User/UserDate';
import { Username } from '~/components/User/Username';
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
          <span className="text-muted small">
            <UserDate dateTime={revision.createdAt} /> ({ t('No diff') })
          </span>
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
      <div className="revision-history-main d-flex">
        <div className="picture-container">
          {pic}
        </div>
        <div className="ml-2">
          <div className="revision-history-author mb-1">
            <strong><Username user={author}></Username></strong>
            {this.props.isLatestRevision && <span className="badge badge-info ml-2">Latest</span>}
          </div>
          <div className="mb-1">
            <UserDate dateTime={revision.createdAt} />
            <br className="d-xl-none d-block" />
            <a className="ml-xl-3" href={`?revision=${revision._id}`}>
              <i className="icon-login"></i> { t('Go to this version') }
            </a>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const revision = this.props.revision;

    if (!this.props.hasDiff) {
      return this.renderSimplifiedNodiff(revision);
    }

    return this.renderFull(revision);

  }

}

Revision.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  revision: PropTypes.object,
  isLatestRevision: PropTypes.bool.isRequired,
  hasDiff: PropTypes.bool.isRequired,
};
