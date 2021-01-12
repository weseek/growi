import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../UnstatedUtils';
import RevisionCompareContainer from '../../services/RevisionCompareContainer';

import UserDate from '../User/UserDate';
import Username from '../User/Username';
import UserPicture from '../User/UserPicture';

const RevisionIdForm = (props) => {

  /**
   * render a revision selector
   * @param {label} label text of inputbox
   */
  const renderRevisionSelector = (label) => {
    if (['page_history.comparing_source', 'page_history.comparing_target'].indexOf(label) === -1) {
      return <></>;
    }
    const forFromRev = (label === 'page_history.comparing_source');

    const { t, revisionCompareContainer } = props;
    const selectedRevision = (forFromRev ? revisionCompareContainer.state.fromRevision : revisionCompareContainer.state.toRevision);

    const author = selectedRevision?.author;
    const pic = (typeof author === 'object') ? <UserPicture user={author} size="lg" /> : '';

    return (
      <div className="card">
        <div className="card-header">{t(label)}</div>
        <div className="card-body">
          { selectedRevision && (
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
                  <UserDate dateTime={selectedRevision.createdAt} />
                </p>
              </div>
            </div>
          </div>
          )}
        </div>
        <div className="card-footer text-muted">
          {selectedRevision && selectedRevision._id}
        </div>
      </div>
    );
  };

  const fromRevSelector = renderRevisionSelector('page_history.comparing_source');
  const toRevSelector = renderRevisionSelector('page_history.comparing_target');

  return (
    <div className="container-fluid px-0">
      <div className="row">
        <div className="mb-3 col-sm">
          { fromRevSelector }
        </div>
        <div className="mb-3 col-sm">
          { toRevSelector }
        </div>
      </div>
    </div>
  );

};

/**
 * Wrapper component for using unstated
 */
const RevisionIdFormWrapper = withUnstatedContainers(RevisionIdForm, [RevisionCompareContainer]);

/**
 * Properties
 */
RevisionIdForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  revisionCompareContainer: PropTypes.instanceOf(RevisionCompareContainer).isRequired,
};

/**
 * Properties
 */
RevisionIdForm.defaultProps = {
};

export default withTranslation()(RevisionIdFormWrapper);
