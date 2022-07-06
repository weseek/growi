import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';

import Revision from './Revision';

class PageRevisionTable extends React.Component {

  /**
   * render a row (Revision component and RevisionDiff component)
   * @param {Revison} revision
   * @param {Revision} previousRevision
   * @param {boolean} hasDiff whether revision has difference to previousRevision
   * @param {boolean} isContiguousNodiff true if the current 'hasDiff' and one of previous row is both false
   */
  renderRow(revision, previousRevision, latestRevision, isOldestRevision, hasDiff) {
    const {
      t, sourceRevision, targetRevision, onChangeSourceInvoked, onChangeTargetInvoked,
    } = this.props;
    const revisionId = revision._id;

    const handleCompareLatestRevisionButton = () => {
      onChangeSourceInvoked(revision);
      onChangeTargetInvoked(latestRevision);
    };

    const handleComparePreviousRevisionButton = () => {
      onChangeSourceInvoked(previousRevision);
      onChangeTargetInvoked(revision);
    };

    return (
      <tr className="d-flex" key={`revision-history-${revisionId}`}>
        <td className="col" key={`revision-history-top-${revisionId}`}>
          <div className="d-lg-flex">
            <Revision
              t={this.props.t}
              revision={revision}
              isLatestRevision={revision === latestRevision}
              hasDiff={hasDiff}
              key={`revision-history-rev-${revisionId}`}
            />
            {hasDiff && (
              <div className="ml-md-3 mt-auto">
                <div className="btn-group">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={handleCompareLatestRevisionButton}
                  >
                    {t('page_history.compare_latest')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={handleComparePreviousRevisionButton}
                    disabled={isOldestRevision}
                  >
                    {t('page_history.compare_previous')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </td>
        <td className="col-1">
          {(hasDiff || revisionId === sourceRevision?._id) && (
            <div className="custom-control custom-radio custom-control-inline mr-0">
              <input
                type="radio"
                className="custom-control-input"
                id={`compareSource-${revisionId}`}
                name="compareSource"
                value={revisionId}
                checked={revisionId === sourceRevision?._id}
                onChange={() => onChangeSourceInvoked(revision)}
              />
              <label className="custom-control-label" htmlFor={`compareSource-${revisionId}`} />
            </div>
          )}
        </td>
        <td className="col-2">
          {(hasDiff || revisionId === targetRevision?._id) && (
            <div className="custom-control custom-radio custom-control-inline mr-0">
              <input
                type="radio"
                className="custom-control-input"
                id={`compareTarget-${revisionId}`}
                name="compareTarget"
                value={revisionId}
                checked={revisionId === targetRevision?._id}
                onChange={() => onChangeTargetInvoked(revision)}
              />
              <label className="custom-control-label" htmlFor={`compareTarget-${revisionId}`} />
            </div>
          )}
        </td>
      </tr>
    );
  }

  render() {
    const { t, pagingLimit } = this.props;

    const revisions = this.props.revisions;
    const revisionCount = this.props.revisions.length;
    const latestRevision = revisions[0];
    const oldestRevision = revisions[revisions.length - 1];

    let hasDiffPrev;

    const revisionList = this.props.revisions.map((revision, idx) => {
      // Returns null because the last revision is for the bottom diff display
      if (idx === pagingLimit) {
        return null;
      }

      let previousRevision;
      if (idx + 1 < revisionCount) {
        previousRevision = revisions[idx + 1];
      }
      else {
        previousRevision = revision; // if it is the first revision, show full text as diff text
      }

      const isOldestRevision = revision === oldestRevision;

      const hasDiff = revision.hasDiffToPrev !== false; // set 'true' if undefined for backward compatibility

      hasDiffPrev = hasDiff;

      return this.renderRow(revision, previousRevision, latestRevision, isOldestRevision, hasDiff);
    });

    return (
      <table className="table revision-history-table">
        <thead>
          <tr className="d-flex">
            <th className="col">{ t('page_history.revision') }</th>
            <th className="col-1">{ t('page_history.comparing_source') }</th>
            <th className="col-2">{ t('page_history.comparing_target') }</th>
          </tr>
        </thead>
        <tbody className="overflow-auto d-block">
          {revisionList}
        </tbody>
      </table>
    );
  }

}

PageRevisionTable.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  revisions: PropTypes.array,
  pagingLimit: PropTypes.number,
  sourceRevision: PropTypes.instanceOf(Object),
  targetRevision: PropTypes.instanceOf(Object),
  onChangeSourceInvoked: PropTypes.func.isRequired,
  onChangeTargetInvoked: PropTypes.func.isRequired,
};

const PageRevisionTableWrapperFC = (props) => {
  const { t } = useTranslation();
  return <PageRevisionTable t={t} {...props} />;
};

export default PageRevisionTableWrapperFC;
