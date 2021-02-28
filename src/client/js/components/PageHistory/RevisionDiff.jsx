/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';

import { createPatch } from 'diff';
import { html } from 'diff2html';
import { withTranslation } from 'react-i18next';
import UserDate from '../User/UserDate';

class RevisionDiff extends React.Component {

  render() {
    const { t } = this.props;
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
    return (
      <>
        <div className="comparison-header">
          <div className="container pt-1 pr-0">
            <div className="row">
              <div className="col comparison-source-wrapper pt-1 px-0">
                <span className="comparison-source pr-3">{t('page_history.comparing_source')}</span><UserDate dateTime={previousRevision.createdAt} />
                <a href={`?revision=${previousRevision._id}`} className="ml-3">
                  <i className="icon-login"></i>
                </a>

              </div>
              <div className="col comparison-target-wrapper pt-1">
                <span className="comparison-target pr-3">{t('page_history.comparing_target')}</span><UserDate dateTime={currentRevision.createdAt} />
                <a href={`?revision=${currentRevision._id}`} className="ml-3">
                  <i className="icon-login"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="revision-history-diff pb-1" dangerouslySetInnerHTML={diffView} />
      </>
    );
  }

}

RevisionDiff.propTypes = {
  t: PropTypes.func.isRequired,
  currentRevision: PropTypes.object.isRequired,
  previousRevision: PropTypes.object.isRequired,
  revisionDiffOpened: PropTypes.bool.isRequired,
};

export default withTranslation()(RevisionDiff);
