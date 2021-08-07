import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import PageHistroyContainer from '~/client/services/PageHistoryContainer';
import RevisionComparerContainer from '~/client/services/RevisionComparerContainer';

import Revision from './Revision';

class PageRevisionTable extends React.Component {

  /**
   * render a row (Revision component and RevisionDiff component)
   * @param {Revison} revision
   * @param {Revision} previousRevision
   * @param {boolean} hasDiff whether revision has difference to previousRevision
   * @param {boolean} isContiguousNodiff true if the current 'hasDiff' and one of previous row is both false
   */
  renderRow(revision, previousRevision, hasDiff, isContiguousNodiff) {
    const { revisionComparerContainer, t } = this.props;
    const { latestRevision, oldestRevision } = this.props.pageHistoryContainer.state;
    const revisionId = revision._id;
    const revisionDiffOpened = this.props.diffOpened[revisionId] || false;
    const { sourceRevision, targetRevision } = revisionComparerContainer.state;

    const handleCompareLatestRevisionButton = () => {
      revisionComparerContainer.setState({ sourceRevision: revision });
      revisionComparerContainer.setState({ targetRevision: latestRevision });
    };

    const handleComparePreviousRevisionButton = () => {
      revisionComparerContainer.setState({ sourceRevision: previousRevision });
      revisionComparerContainer.setState({ targetRevision: revision });
    };

    return (
      <tr className="d-flex" key={`revision-history-${revisionId}`}>
        <td className="col" key={`revision-history-top-${revisionId}`}>
          <div className="d-lg-flex">
            <Revision
              t={this.props.t}
              revision={revision}
              isLatestRevision={revision === latestRevision}
              revisionDiffOpened={revisionDiffOpened}
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
                    disabled={revision === oldestRevision}
                  >
                    {t('page_history.compare_previous')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </td>
        <td className="col-1">
          {(hasDiff || revision._id === sourceRevision?._id) && (
            <div className="custom-control custom-radio custom-control-inline mr-0">
              <input
                type="radio"
                className="custom-control-input"
                id={`compareSource-${revision._id}`}
                name="compareSource"
                value={revision._id}
                checked={revision._id === sourceRevision?._id}
                onChange={() => revisionComparerContainer.setState({ sourceRevision: revision })}
              />
              <label className="custom-control-label" htmlFor={`compareSource-${revision._id}`} />
            </div>
          )}
        </td>
        <td className="col-2">
          {(hasDiff || revision._id === targetRevision?._id) && (
            <div className="custom-control custom-radio custom-control-inline mr-0">
              <input
                type="radio"
                className="custom-control-input"
                id={`compareTarget-${revision._id}`}
                name="compareTarget"
                value={revision._id}
                checked={revision._id === targetRevision?._id}
                onChange={() => revisionComparerContainer.setState({ targetRevision: revision })}
              />
              <label className="custom-control-label" htmlFor={`compareTarget-${revision._id}`} />
            </div>
          )}
        </td>
      </tr>
    );
  }

  render() {
    const { t, pageHistoryContainer } = this.props;

    const revisions = this.props.revisions;
    const revisionCount = this.props.revisions.length;

    let hasDiffPrev;

    const revisionList = this.props.revisions.map((revision, idx) => {
      // Returns null because the last revision is for the bottom diff display
      if (idx === pageHistoryContainer.state.pagingLimit) {
        return null;
      }

      let previousRevision;
      if (idx + 1 < revisionCount) {
        previousRevision = revisions[idx + 1];
      }
      else {
        previousRevision = revision; // if it is the first revision, show full text as diff text
      }


      const hasDiff = revision.hasDiffToPrev !== false; // set 'true' if undefined for backward compatibility
      const isContiguousNodiff = !hasDiff && !hasDiffPrev;

      hasDiffPrev = hasDiff;

      return this.renderRow(revision, previousRevision, hasDiff, isContiguousNodiff);
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
  pageHistoryContainer: PropTypes.instanceOf(PageHistroyContainer).isRequired,
  revisionComparerContainer: PropTypes.instanceOf(RevisionComparerContainer).isRequired,

  revisions: PropTypes.array,
  diffOpened: PropTypes.object,
};

export default withTranslation()(PageRevisionTable);
