import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import PageHistroyContainer from '../../services/PageHistoryContainer';

import Revision from './Revision';
import RevisionSelector from '../RevisionComparer/RevisionSelector';
import RevisionComparerContainer from '../RevisionComparer/RevisionComparer';

class PageRevisionList extends React.Component {

  /**
   * render a row (Revision component and RevisionDiff component)
   * @param {Revison} revision
   * @param {Revision} previousRevision
   * @param {boolean} hasDiff whether revision has difference to previousRevision
   * @param {boolean} isContiguousNodiff true if the current 'hasDiff' and one of previous row is both false
   */
  renderRow(revision, previousRevision, hasDiff, isContiguousNodiff) {
    const { revisionComparerContainer } = this.props;
    const { latestRevision } = this.props.pageHistoryContainer.state;
    const revisionId = revision._id;
    const revisionDiffOpened = this.props.diffOpened[revisionId] || false;

    const classNames = ['revision-history-outer', 'row', 'no-gutters'];
    if (isContiguousNodiff) {
      classNames.push('revision-history-outer-contiguous-nodiff');
    }

    const handleCompareLatestRevisionButton = () => {
      revisionComparerContainer.setState({ sourceRevision: revision });
      revisionComparerContainer.setState({ targetRevision: latestRevision });
    };

    const handleComparePreviousRevisionButton = () => {
      revisionComparerContainer.setState({ sourceRevision: previousRevision });
      revisionComparerContainer.setState({ targetRevision: revision });
    };

    return (
      <div className={classNames.join(' ')} key={`revision-history-${revisionId}`}>
        <div className="col-6 d-flex" key={`revision-history-top-${revisionId}`}>
          <Revision
            t={this.props.t}
            revision={revision}
            isLatestRevision={revision === latestRevision}
            revisionDiffOpened={revisionDiffOpened}
            hasDiff={hasDiff}
            key={`revision-history-rev-${revisionId}`}
          />
          {hasDiff && (
            <div className="dropdown mt-auto mb-3 ml-5">
              <button
                className="btn btn-primary dropdown-toggle"
                type="button"
                id="dropdownMenuButton"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="true"
              >
                <span className="float-left">
                  最新と比較
                </span>
              </button>
              <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <button className="dropdown-item" type="button" onClick={handleCompareLatestRevisionButton}>
                  最新と比較
                </button>
                <button className="dropdown-item" type="button" onClick={handleComparePreviousRevisionButton}>
                  1つ前のバージョンと比較
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="col-6 align-self-center">
          <RevisionSelector
            revision={revision}
            hasDiff={hasDiff}
            key={`revision-compare-target-selector-${revisionId}`}
          />
        </div>
      </div>
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
      <React.Fragment>
        <div className="revision-history-list">
          <div className="revision-history-list-content-header bg-white mb-3 px-4">
            <div className="row no-gutters">
              <div className="col-6">{ t('page_history.revision') }</div>
              <div className="col-3 text-center">{ t('page_history.comparing_source') }</div>
              <div className="col-3 text-center">{ t('page_history.comparing_target') }</div>
            </div>
          </div>
          <div className="revision-history-list-container border py-2 px-4 overflow-auto">
            <div className="revision-history-list-content-body">
              {revisionList}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

}

PageRevisionList.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  pageHistoryContainer: PropTypes.instanceOf(PageHistroyContainer).isRequired,
  revisionComparerContainer: PropTypes.instanceOf(RevisionComparerContainer).isRequired,

  revisions: PropTypes.array,
  diffOpened: PropTypes.object,
};

export default withTranslation()(PageRevisionList);
