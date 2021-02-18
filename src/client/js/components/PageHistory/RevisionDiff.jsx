/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';

import { createPatch } from 'diff';
import { html } from 'diff2html';
import UserDate from '../User/UserDate';

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
      const option = {
        drawFileList: false,
        outputFormat: 'side-by-side',
      };

      diffViewHTML = html(patch, option);
    }

    const diffView = { __html: diffViewHTML };
    // eslint-disable-next-line react/no-danger
    return (
      <>
        <div className="comparison-header py-2">
          <div className="container pr-0">
            <div className="row">
              <div className="col comparison-source-wrapper px-0">
                <span className="comparison-source pr-3">ソース</span><UserDate dateTime={previousRevision.createdAt} />
                <a href={`?revision=${previousRevision._id}`} className="ml-3">
                  <i className="icon-login"></i>
                </a>

              </div>
              <div className="col comparison-target-wrapper">
                <span className="comparison-target pr-3">ターゲット</span><UserDate dateTime={currentRevision.createdAt} />
                <a href={`?revision=${currentRevision._id}`} className="ml-3">
                  <i className="icon-login"></i>
                </a>


              </div>
            </div>


          </div>


        </div>
        <div className="revision-history-diff" dangerouslySetInnerHTML={diffView} />
      </>
    );
  }

}

RevisionDiff.propTypes = {
  currentRevision: PropTypes.object.isRequired,
  previousRevision: PropTypes.object.isRequired,
  revisionDiffOpened: PropTypes.bool.isRequired,
};
