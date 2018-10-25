import React from 'react';
import PropTypes from 'prop-types';

import Revision     from './Revision';
import RevisionDiff from './RevisionDiff';

export default class PageRevisionList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      showNodiffRevisions: false,
    };
  }

  /**
   * render a row (Revision component and RevisionDiff component)
   * @param {Revison} revision
   * @param {Revision} previousRevision
   * @param {boolean} hasDiff whether revision has difference to previousRevision
   * @param {boolean} isContiguousNodiff true if the current 'hasDiff' and one of previous row is both false
   */
  renderRow(revision, previousRevision, hasDiff, isContiguousNodiff) {
    const revisionId = revision._id;
    const revisionDiffOpened = this.props.diffOpened[revisionId] || false;

    const classNames = ['revision-history-outer'];
    if (isContiguousNodiff) {
      classNames.push('revision-history-outer-contiguous-nodiff');
    }

    return (
      <div className={classNames.join(' ')} key={`revision-history-${revisionId}`}>
        <Revision
          revision={revision}
          revisionDiffOpened={revisionDiffOpened}
          hasDiff={hasDiff}
          showNodiffRevisions={this.state.showNodiffRevisions}
          onDiffOpenClicked={this.props.onDiffOpenClicked}
          key={`revision-history-rev-${revisionId}`}
          />
        { hasDiff &&
          <RevisionDiff
            revisionDiffOpened={revisionDiffOpened}
            currentRevision={revision}
            previousRevision={previousRevision}
            key={`revision-deff-${revisionId}`}
          />
        }
      </div>
    );
  }

  render() {
    const revisions = this.props.revisions,
      revisionCount = this.props.revisions.length;

    let hasDiffPrev;

    const revisionList = this.props.revisions.map((revision, idx) => {
      let previousRevision;
      if (idx+1 < revisionCount) {
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
      <div className="revision-history-list">
        {revisionList}
      </div>
    );
  }
}

PageRevisionList.propTypes = {
  revisions: PropTypes.array,
  diffOpened: PropTypes.object,
  onDiffOpenClicked: PropTypes.func.isRequired,
};

