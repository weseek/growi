import React from 'react';
import PropTypes from 'prop-types';

import { createPatch } from 'diff';
import { Diff2Html } from 'diff2html';

export default class RevisionDiff extends React.Component {

  render() {
    const currentRevision = this.props.currentRevision;
    const previousRevision = this.props.previousRevision;
    const revisionDiffOpened = this.props.revisionDiffOpened;


    let diffViewHTML = '';
    if (currentRevision.body
      && previousRevision.body
      && revisionDiffOpened) {

      let previousText = previousRevision.body;
      // comparing ObjectId
      // eslint-disable-next-line eqeqeq
      if (currentRevision._id == previousRevision._id) {
        previousText = '';
      }

      const patch = createPatch(
        currentRevision.path,
        previousText,
        currentRevision.body,
      );

      diffViewHTML = Diff2Html.getPrettyHtml(patch);
    }

    const diffView = { __html: diffViewHTML };
    // eslint-disable-next-line react/no-danger
    return <div className="revision-history-diff" dangerouslySetInnerHTML={diffView} />;
  }

}

RevisionDiff.propTypes = {
  currentRevision: PropTypes.object.isRequired,
  previousRevision: PropTypes.object.isRequired,
  revisionDiffOpened: PropTypes.bool.isRequired,
};
