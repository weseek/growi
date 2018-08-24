import React from 'react';
import PropTypes from 'prop-types';

import Revision     from './Revision';
import RevisionDiff from './RevisionDiff';

export default class PageRevisionList extends React.Component {

  render() {
    const revisions = this.props.revisions,
      revisionCount = this.props.revisions.length;

    const revisionList = this.props.revisions.map((revision, idx) => {
      const revisionId = revision._id
        , revisionDiffOpened = this.props.diffOpened[revisionId] || false;


      let previousRevision;
      if (idx+1 < revisionCount) {
        previousRevision = revisions[idx + 1];
      }
      else {
        previousRevision = revision; // if it is the first revision, show full text as diff text
      }

      return (
        <div className="revision-hisory-outer" key={'revision-history-' + revisionId}>
          <Revision
            revision={revision}
            revisionDiffOpened={revisionDiffOpened}
            onDiffOpenClicked={this.props.onDiffOpenClicked}
            key={'revision-history-rev-' + revisionId}
            />
          <RevisionDiff
            revisionDiffOpened={revisionDiffOpened}
            currentRevision={revision}
            previousRevision={previousRevision}
            key={'revision-diff-' + revisionId}
          />
        </div>
      );
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

