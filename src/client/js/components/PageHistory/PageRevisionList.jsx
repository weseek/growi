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

  renderRow(revision, previousRevision) {
    const revisionId = revision._id;
    const revisionDiffOpened = this.props.diffOpened[revisionId] || false;

    const hasDiff = revision.hasDiffToPrev !== false; // set 'true' if undefined for backward compatibility

    return (
      <div className="revision-history-outer" key={`revision-history-${revisionId}`}>
        <Revision
          revision={revision}
          revisionDiffOpened={revisionDiffOpened}
          hasDiff={hasDiff}
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

    const revisionList = this.props.revisions.map((revision, idx) => {
      let previousRevision;
      if (idx+1 < revisionCount) {
        previousRevision = revisions[idx + 1];
      }
      else {
        previousRevision = revision; // if it is the first revision, show full text as diff text
      }

      return this.renderRow(revision, previousRevision);
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

