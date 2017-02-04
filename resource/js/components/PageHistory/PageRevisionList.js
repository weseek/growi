import React from 'react';

import Revision from './Revision';

export default class PageRevisionList extends React.Component {

  fetchPreviousRevision(currentRevision) {

    let cursor = null;
    for (let revision of this.props.revisions) {
      if (cursor && cursor._id == currentRevision._id) {
        cursor = revision;
        break;
      }

      cursor = revision;
    }

    console.log('previous is', cursor);
  }

  render() {
    const revisionList = this.props.revisions.map((revision) =>
      <Revision key={revision._id} revision={revision} fetchPreviousRevision={this.fetchPreviousRevision.bind(this)} />
    );

    return (
      <div className="revision-history-list">
        {revisionList}
      </div>
    );
  }
}

PageRevisionList.propTypes = {
  revisions: React.PropTypes.array,
}

