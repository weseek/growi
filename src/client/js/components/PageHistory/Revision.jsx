import React from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../UnstatedUtils';
import { withLoadingSppiner } from '../SuspenseUtils';

import UserDate from '../User/UserDate';
import Username from '../User/Username';
import UserPicture from '../User/UserPicture';

import RevisionCompareContainer from '../../services/RevisionCompareContainer';

class Revision extends React.Component {

  constructor(props) {
    super(props);

    this._onDiffOpenClicked = this._onDiffOpenClicked.bind(this);
  }

  componentDidMount() {
  }

  _onDiffOpenClicked(e) {
    e.preventDefault();
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
    const { t, revisionCompareContainer } = this.props;

    const author = revision.author;

    let pic = '';
    if (typeof author === 'object') {
      pic = <UserPicture user={author} size="lg" />;
    }

    const iconClass = this.props.revisionDiffOpened ? 'fa fa-caret-down caret caret-opened' : 'fa fa-caret-down caret';
    const latestRevision = revisionCompareContainer.state.latestRevision;
    return (
      <div className="revision-history-main d-flex mt-3">
        <div className="mt-2">
          {pic}
        </div>
        <div className="ml-2">
          <div className="revision-history-author">
            <strong><Username user={author}></Username></strong>
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
                  // use dummy href attr (with preventDefault()), because don't apply style by a:not([href])
                  <a className="diff-view" href="" onClick={this._onDiffOpenClicked}>
                    <i className={iconClass}></i> {t('View diff')}
                  </a>
                  )
                }
              </span>
              <a href={`?revision=${revision._id}`} className="ml-2 d-inline-block">
                <i className="icon-login"></i> { t('Go to this version') }
              </a>
              <span className="ml-2 btn-group d-inline-block">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => revisionCompareContainer.setState({ fromRevision: revision, toRevision: latestRevision })}
                >
                  {t('page_history.comparing_with_latest')}
                </button>
                <button
                  type="button"
                  className="btn btn-light dropdown-toggle dropdown-toggle-split"
                  id="bgCompareRevision"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                  data-reference="parent"
                >
                  <span className="sr-only">{t('page_history.comparing_versions')}</span>
                </button>
                <span className="dropdown-menu" aria-labelledby="bgCompareRevision">
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={() => revisionCompareContainer.setState({ fromRevision: revision })}
                  >
                    {t('page_history.select_as_a_comparing_source')}
                  </a>
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={() => revisionCompareContainer.setState({ toRevision: revision })}
                  >
                    {t('page_history.select_as_a_comparing_target')}
                  </a>
                </span>
              </span>
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

const RevisionWrapper = withUnstatedContainers(withLoadingSppiner(Revision), [RevisionCompareContainer]);

Revision.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  revisionCompareContainer: PropTypes.instanceOf(RevisionCompareContainer).isRequired,

  revision: PropTypes.object,
  revisionDiffOpened: PropTypes.bool.isRequired,
  hasDiff: PropTypes.bool.isRequired,
  isCompactNodiffRevisions: PropTypes.bool.isRequired,
  onDiffOpenClicked: PropTypes.func.isRequired,
};

export default RevisionWrapper;
